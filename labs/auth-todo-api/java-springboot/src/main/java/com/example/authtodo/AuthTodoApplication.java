package com.example.authtodo;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@SpringBootApplication
@RestController
public class AuthTodoApplication implements WebMvcConfigurer {

    private static final String SECRET = "syntax-party-jwt-lab";

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final List<User> users = new ArrayList<User>();
    private final AtomicLong seq = new AtomicLong(1);
    private final Map<Long, Todo> store = new ConcurrentHashMap<Long, Todo>();

    public AuthTodoApplication() {
        users.add(new User(1L, "demo", "user", encoder.encode("password")));
        users.add(new User(2L, "admin", "admin", encoder.encode("password")));
    }

    public static void main(String[] args) {
        SpringApplication.run(AuthTodoApplication.class, args);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new JwtInterceptor())
                .addPathPatterns("/**")
                .excludePathPatterns("/health", "/login");
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> body = new LinkedHashMap<String, String>();
        body.put("status", "ok");
        return body;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginIn in) {
        String username = in == null || in.username == null ? "" : in.username;
        String password = in == null || in.password == null ? "" : in.password;
        User user = findByName(username);
        if (user == null || !encoder.matches(password, user.passwordHash)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid credentials");
        }
        String token = Jwts.builder()
                .setSubject(String.valueOf(user.id))
                .claim("username", user.username)
                .claim("role", user.role)
                .setExpiration(new Date(System.currentTimeMillis() + 3600_000L))
                .signWith(SignatureAlgorithm.HS256, SECRET.getBytes(StandardCharsets.UTF_8))
                .compact();
        Map<String, Object> body = new LinkedHashMap<String, Object>();
        body.put("token", token);
        body.put("user", publicUser(user));
        return body;
    }

    @GetMapping("/me")
    public Map<String, Object> me(HttpServletRequest req) {
        return publicUser(current(req));
    }

    @GetMapping("/todos")
    public Map<String, Object> list(HttpServletRequest req) {
        User user = current(req);
        List<Todo> items = new ArrayList<Todo>();
        for (Todo item : store.values()) {
            if ("admin".equals(user.role) || item.ownerId.equals(user.id)) {
                items.add(item);
            }
        }
        Map<String, Object> body = new LinkedHashMap<String, Object>();
        body.put("items", items);
        return body;
    }

    @PostMapping("/todos")
    public ResponseEntity<Todo> create(HttpServletRequest req, @RequestBody CreateIn in) {
        if (in == null || in.title == null || in.title.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }
        User user = current(req);
        Todo item = new Todo(seq.getAndIncrement(), in.title.trim(), false, user.id);
        store.put(item.id, item);
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }

    @PatchMapping("/todos/{id}")
    public Todo patch(HttpServletRequest req, @PathVariable Long id, @RequestBody PatchIn in) {
        User user = current(req);
        Todo item = store.get(id);
        if (item == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "todo not found");
        }
        if (!canWrite(user, item)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "forbidden");
        }
        if (in != null && in.title != null && !in.title.trim().isEmpty()) {
            item.title = in.title.trim();
        }
        if (in != null && in.done != null) {
            item.done = in.done.booleanValue();
        }
        return item;
    }

    @DeleteMapping("/todos/{id}")
    public ResponseEntity<Void> delete(HttpServletRequest req, @PathVariable Long id) {
        User user = current(req);
        Todo item = store.get(id);
        if (item == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "todo not found");
        }
        if (!canWrite(user, item)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "forbidden");
        }
        store.remove(id);
        return ResponseEntity.noContent().build();
    }

    private User current(HttpServletRequest req) {
        return (User) req.getAttribute("authUser");
    }

    private User findByName(String username) {
        for (User user : users) {
            if (user.username.equals(username)) {
                return user;
            }
        }
        return null;
    }

    private User findById(Long id) {
        for (User user : users) {
            if (user.id.equals(id)) {
                return user;
            }
        }
        return null;
    }

    private boolean canWrite(User user, Todo item) {
        return item.ownerId.equals(user.id) || "admin".equals(user.role);
    }

    private Map<String, Object> publicUser(User user) {
        Map<String, Object> body = new LinkedHashMap<String, Object>();
        body.put("id", user.id);
        body.put("username", user.username);
        body.put("role", user.role);
        return body;
    }

    private class JwtInterceptor implements HandlerInterceptor {
        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
                throws Exception {
            if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                return true;
            }
            String header = request.getHeader("Authorization");
            if (header == null || !header.startsWith("Bearer ")) {
                writeUnauthorized(response);
                return false;
            }
            String token = header.substring(7).trim();
            try {
                Claims claims = Jwts.parser()
                        .setSigningKey(SECRET.getBytes(StandardCharsets.UTF_8))
                        .parseClaimsJws(token)
                        .getBody();
                Long id = Long.valueOf(claims.getSubject());
                User user = findById(id);
                if (user == null) {
                    writeUnauthorized(response);
                    return false;
                }
                request.setAttribute("authUser", user);
                return true;
            } catch (Exception ex) {
                writeUnauthorized(response);
                return false;
            }
        }

        private void writeUnauthorized(HttpServletResponse response) throws Exception {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\":\"unauthorized\"}");
        }
    }

    @ControllerAdvice
    public static class Errors {
        @ExceptionHandler(ResponseStatusException.class)
        public ResponseEntity<Map<String, String>> handle(ResponseStatusException ex) {
            Map<String, String> body = new LinkedHashMap<String, String>();
            body.put("error", ex.getReason() == null ? "error" : ex.getReason());
            return ResponseEntity.status(ex.getStatus()).body(body);
        }
    }

    public static class User {
        public Long id;
        public String username;
        public String role;
        public String passwordHash;

        public User(Long id, String username, String role, String passwordHash) {
            this.id = id;
            this.username = username;
            this.role = role;
            this.passwordHash = passwordHash;
        }
    }

    public static class Todo {
        public Long id;
        public String title;
        public boolean done;
        public Long ownerId;

        public Todo() {
        }

        public Todo(Long id, String title, boolean done, Long ownerId) {
            this.id = id;
            this.title = title;
            this.done = done;
            this.ownerId = ownerId;
        }
    }

    public static class LoginIn {
        public String username;
        public String password;
    }

    public static class CreateIn {
        public String title;
    }

    public static class PatchIn {
        public String title;
        public Boolean done;
    }
}
