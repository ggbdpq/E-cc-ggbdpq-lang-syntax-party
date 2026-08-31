package main

import (
	"net/http"
	"strconv"
	"sync"

	"github.com/gin-gonic/gin"
)

type Todo struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
	Done  bool   `json:"done"`
}

type createIn struct {
	Title string `json:"title"`
}

type patchIn struct {
	Title *string `json:"title"`
	Done  *bool   `json:"done"`
}

var (
	mu    sync.Mutex
	seq   = 1
	todos = []Todo{}
)

func cors() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type,Authorization")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}

func findIndex(id int) int {
	for i, t := range todos {
		if t.ID == id {
			return i
		}
	}
	return -1
}

func main() {
	r := gin.Default()
	r.Use(cors())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	r.GET("/todos", func(c *gin.Context) {
		mu.Lock()
		defer mu.Unlock()
		c.JSON(http.StatusOK, gin.H{"items": todos})
	})

	r.POST("/todos", func(c *gin.Context) {
		var body createIn
		if err := c.ShouldBindJSON(&body); err != nil || body.Title == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "title required"})
			return
		}
		mu.Lock()
		item := Todo{ID: seq, Title: body.Title, Done: false}
		seq++
		todos = append(todos, item)
		mu.Unlock()
		c.JSON(http.StatusCreated, item)
	})

	r.PATCH("/todos/:id", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
			return
		}
		var body patchIn
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
			return
		}
		mu.Lock()
		defer mu.Unlock()
		i := findIndex(id)
		if i < 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "todo not found"})
			return
		}
		if body.Title != nil && *body.Title != "" {
			todos[i].Title = *body.Title
		}
		if body.Done != nil {
			todos[i].Done = *body.Done
		}
		c.JSON(http.StatusOK, todos[i])
	})

	r.DELETE("/todos/:id", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
			return
		}
		mu.Lock()
		defer mu.Unlock()
		i := findIndex(id)
		if i < 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "todo not found"})
			return
		}
		todos = append(todos[:i], todos[i+1:]...)
		c.Status(http.StatusNoContent)
	})

	r.Run(":8013")
}
