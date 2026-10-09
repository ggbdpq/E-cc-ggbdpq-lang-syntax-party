// auth-todo-api 提供内存中的教学 HTTP 服务。
package main

import (
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

const secret = "syntax-party-jwt-lab"

type User struct {
	ID           int
	Username     string
	Role         string
	PasswordHash []byte
}

type Todo struct {
	ID      int    `json:"id"`
	Title   string `json:"title"`
	Done    bool   `json:"done"`
	OwnerID int    `json:"ownerId"`
}

type loginIn struct {
	Username string `json:"username"`
	Password string `json:"password"`
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
	users []User
)

func mustHash(raw string) []byte {
	hash, err := bcrypt.GenerateFromPassword([]byte(raw), bcrypt.DefaultCost)
	if err != nil {
		panic(err)
	}
	return hash
}

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

func publicUser(u User) gin.H {
	return gin.H{"id": u.ID, "username": u.Username, "role": u.Role}
}

func findUserByName(name string) *User {
	for i := range users {
		if users[i].Username == name {
			return &users[i]
		}
	}
	return nil
}

func findUserByID(id int) *User {
	for i := range users {
		if users[i].ID == id {
			return &users[i]
		}
	}
	return nil
}

func findTodoIndex(id int) int {
	for i, t := range todos {
		if t.ID == id {
			return i
		}
	}
	return -1
}

func canWrite(user User, item Todo) bool {
	return item.OwnerID == user.ID || user.Role == "admin"
}

func jwtAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		raw := strings.TrimSpace(header[7:])
		token, err := jwt.Parse(raw, func(t *jwt.Token) (any, error) {
			if t.Method != jwt.SigningMethodHS256 {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(secret), nil
		})
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		sub, _ := claims["sub"].(string)
		id, err := strconv.Atoi(sub)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		user := findUserByID(id)
		if user == nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		c.Set("user", *user)
		c.Next()
	}
}

func currentUser(c *gin.Context) User {
	v, _ := c.Get("user")
	return v.(User) //nolint:errcheck,forcetypeassert // jwtAuth 验证后写入 User，仅已认证路由调用。
}

func main() {
	users = []User{
		{ID: 1, Username: "demo", Role: "user", PasswordHash: mustHash("password")},
		{ID: 2, Username: "admin", Role: "admin", PasswordHash: mustHash("password")},
	}

	r := gin.Default()
	r.Use(cors())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	r.POST("/login", func(c *gin.Context) {
		var body loginIn
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
			return
		}
		user := findUserByName(body.Username)
		if user == nil || bcrypt.CompareHashAndPassword(user.PasswordHash, []byte(body.Password)) != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
			return
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"sub":      strconv.Itoa(user.ID),
			"username": user.Username,
			"role":     user.Role,
			"exp":      time.Now().Add(time.Hour).Unix(),
		})
		signed, err := token.SignedString([]byte(secret))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "sign failed"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"token": signed, "user": publicUser(*user)})
	})

	auth := r.Group("/")
	auth.Use(jwtAuth())
	auth.GET("/me", func(c *gin.Context) {
		c.JSON(http.StatusOK, publicUser(currentUser(c)))
	})
	auth.GET("/todos", func(c *gin.Context) {
		user := currentUser(c)
		mu.Lock()
		defer mu.Unlock()
		items := make([]Todo, 0)
		for _, t := range todos {
			if user.Role == "admin" || t.OwnerID == user.ID {
				items = append(items, t)
			}
		}
		c.JSON(http.StatusOK, gin.H{"items": items})
	})
	auth.POST("/todos", func(c *gin.Context) {
		var body createIn
		if err := c.ShouldBindJSON(&body); err != nil || strings.TrimSpace(body.Title) == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "title is required"})
			return
		}
		user := currentUser(c)
		mu.Lock()
		item := Todo{ID: seq, Title: strings.TrimSpace(body.Title), Done: false, OwnerID: user.ID}
		seq++
		todos = append(todos, item)
		mu.Unlock()
		c.JSON(http.StatusCreated, item)
	})
	auth.PATCH("/todos/:id", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "todo not found"})
			return
		}
		var body patchIn
		_ = c.ShouldBindJSON(&body)
		user := currentUser(c)
		mu.Lock()
		defer mu.Unlock()
		i := findTodoIndex(id)
		if i < 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "todo not found"})
			return
		}
		if !canWrite(user, todos[i]) {
			c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			return
		}
		if body.Title != nil && strings.TrimSpace(*body.Title) != "" {
			todos[i].Title = strings.TrimSpace(*body.Title)
		}
		if body.Done != nil {
			todos[i].Done = *body.Done
		}
		c.JSON(http.StatusOK, todos[i])
	})
	auth.DELETE("/todos/:id", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "todo not found"})
			return
		}
		user := currentUser(c)
		mu.Lock()
		defer mu.Unlock()
		i := findTodoIndex(id)
		if i < 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "todo not found"})
			return
		}
		if !canWrite(user, todos[i]) {
			c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			return
		}
		todos = append(todos[:i], todos[i+1:]...)
		c.Status(http.StatusNoContent)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8023"
	}
	if err := r.Run(":" + port); err != nil {
		panic(err)
	}
}
