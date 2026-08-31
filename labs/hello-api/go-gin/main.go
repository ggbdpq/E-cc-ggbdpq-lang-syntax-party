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
	r.Run(":8003")
}
