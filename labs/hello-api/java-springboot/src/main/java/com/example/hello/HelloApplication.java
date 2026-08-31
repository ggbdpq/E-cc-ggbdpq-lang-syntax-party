package com.example.hello;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@SpringBootApplication
@RestController
public class HelloApplication {

    public static void main(String[] args) {
        SpringApplication.run(HelloApplication.class, args);
    }

    @GetMapping("/hello")
    public Map<String, String> hello() {
        Map<String, String> body = new LinkedHashMap<>();
        body.put("message", "Hello World");
        body.put("language", "Java");
        body.put("framework", "Spring Boot");
        return body;
    }
}
