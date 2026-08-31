package com.example.todo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@SpringBootApplication
@RestController
public class TodoApplication implements WebMvcConfigurer {

    private final AtomicLong seq = new AtomicLong(1);
    private final Map<Long, Todo> store = new ConcurrentHashMap<Long, Todo>();

    public static void main(String[] args) {
        SpringApplication.run(TodoApplication.class, args);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> body = new LinkedHashMap<String, String>();
        body.put("status", "ok");
        return body;
    }

    @GetMapping("/todos")
    public Map<String, Object> list() {
        Map<String, Object> body = new LinkedHashMap<String, Object>();
        body.put("items", new ArrayList<Todo>(store.values()));
        return body;
    }

    @PostMapping("/todos")
    public ResponseEntity<Todo> create(@RequestBody CreateIn in) {
        if (in == null || in.title == null || in.title.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title required");
        }
        Todo item = new Todo(seq.getAndIncrement(), in.title.trim(), false);
        store.put(item.id, item);
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }

    @PatchMapping("/todos/{id}")
    public Todo patch(@PathVariable Long id, @RequestBody PatchIn in) {
        Todo item = store.get(id);
        if (item == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "todo not found");
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
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (store.remove(id) == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "todo not found");
        }
        return ResponseEntity.noContent().build();
    }

    public static class Todo {
        public Long id;
        public String title;
        public boolean done;

        public Todo() {
        }

        public Todo(Long id, String title, boolean done) {
            this.id = id;
            this.title = title;
            this.done = done;
        }
    }

    public static class CreateIn {
        public String title;
    }

    public static class PatchIn {
        public String title;
        public Boolean done;
    }
}
