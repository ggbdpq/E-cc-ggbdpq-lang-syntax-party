package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.GET("/hello", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message":   "Hello World",
			"language":  "Go",
			"framework": "Gin",
		})
	})
	if err := r.Run(":8003"); err != nil {
		panic(err)
	}
}
