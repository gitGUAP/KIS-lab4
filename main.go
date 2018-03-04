package main

//
//
import (
	"database/sql" // Интерфейс для работы со SQL-like БД
	"encoding/json"
	"fmt" // Шаблоны для выдачи html страниц
	"io/ioutil"
	"log"      // Вывод информации в консоль
	"net/http" // Для запуска HTTP сервера
	"strconv"
	"strings"

	"github.com/gorilla/mux"
	sqlite "github.com/mattn/go-sqlite3" // Драйвер для работы со SQLite3
	//home/federal/go/src/github.com/gitGUAP/KIS-lab4
	"github.com/buger/jsonparser"
	h "github.com/gitGUAP/KIS-lab4/handlers"
)

// type Result interface {
// 	// LastInsertId returns the integer generated by the database
// 	// in response to a command. Typically this will be from an
// 	// "auto increment" column when inserting a new row. Not all
// 	// databases support this feature, and the syntax of such
// 	// statements varies.
// 	LastInsertId() (int64, error)

// 	// RowsAffected returns the number of rows affected by an
// 	// update, insert, or delete. Not every database or database
// 	// driver may support this.
// 	RowsAffected() (int64, error)
// }
// DB указатель на соединение с базой данных

func GoToLower(str string, find string) bool {
	str = strings.ToLower(str)
	find = strings.ToLower(find)
	return strings.Index(str, find) != -1
}

func Insert(w http.ResponseWriter, r *http.Request) {

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Fatal(err)
	}

	name, err := jsonparser.GetString(body, "name_cat")
	if err != nil {
		log.Fatal(err)
	}
	url, err := jsonparser.GetString(body, "url_cat")
	if err != nil {
		log.Fatal(err)
	}

	res, err := h.DB.Exec("INSERT INTO Category(name_cat, url_cat) VALUES(?,?)", name, url)

	if err != nil {
		log.Fatal(err)
	}
	affected, _ := res.RowsAffected()

	outJSON, _ := json.Marshal(el)

	fmt.Fprintf(w, strconv.Itoa(int(affected)))

}

func DeleteItem(w http.ResponseWriter, r *http.Request) {
	bodyBytes, _ := ioutil.ReadAll(r.Body)
	body1 := string(bodyBytes)

	res, err := h.DB.Exec("delete from Category where id_cat = " + body1)

	if err != nil {
		log.Fatal(err)
	}

	affected, _ := res.RowsAffected()
	fmt.Fprintf(w, strconv.Itoa(int(affected)))
}

func GetSearch(w http.ResponseWriter, r *http.Request) {
	bodyBytes, _ := ioutil.ReadAll(r.Body)
	bodyString := string(bodyBytes)

	qry := fmt.Sprintf(`SELECT * FROM Category WHERE 
		GoToLower(name_cat, '%s') = 1`, strings.ToLower(bodyString))

	rows, err := h.DB.Query(qry)
	if err != nil {
		log.Fatal(err)
	}

	el := []h.DBCategory{}
	for rows.Next() {
		var temp h.DBCategory
		rows.Scan(&temp.ID, &temp.Name, &temp.URL)
		el = append(el, temp)
	}

	outJSON, _ := json.Marshal(el)
	fmt.Fprintf(w, string(outJSON))
}

// func GetIndex(w http.ResponseWriter, r *http.Request) {

// 	rows, err := DB.Query(`SELECT * FROM Category`)
// 	if err != nil {
// 		log.Fatal(err)
// 	}

// 	tmpl, _ := template.ParseFiles("tmpl/index.html")

// 	el := []DBCategory{}
// 	for rows.Next() {
// 		var temp DBCategory
// 		rows.Scan(&temp.ID, &temp.Name, &temp.URL)
// 		el = append(el, temp)
// 	}

// 	tmpl.Execute(w, el)
// }

func GetList(w http.ResponseWriter, r *http.Request) {
	bodyBytes, _ := ioutil.ReadAll(r.Body)
	bodyString := string(bodyBytes)

	rows, err := h.DB.Query(`SELECT * FROM Category ORDER BY name_cat` + bodyString)

	if err != nil {
		log.Fatal(err)
	}

	el := []h.DBCategory{}
	for rows.Next() {
		var temp h.DBCategory
		rows.Scan(&temp.ID, &temp.Name, &temp.URL)
		el = append(el, temp)
	}

	outJSON, _ := json.Marshal(el)
	fmt.Fprintf(w, string(outJSON))
}

func main() {

	h.Pr()

	log.SetFlags(log.LstdFlags | log.Lshortfile)

	sql.Register("sqlite3_custom", &sqlite.SQLiteDriver{
		ConnectHook: func(conn *sqlite.SQLiteConn) error {
			if err := conn.RegisterFunc("GoToLower", GoToLower, true); err != nil {
				return err
			}
			return nil
		},
	})

	var err error

	h.DB, err = sql.Open("sqlite3_custom", "./sqlite.db")
	if err != nil {
		log.Fatal(err)
	}
	defer h.DB.Close()

	router := mux.NewRouter()
	s := http.StripPrefix("/static/", http.FileServer(http.Dir("./static/")))

	router.HandleFunc("/", h.GetIndex).Methods("GET")
	router.HandleFunc("/list", GetList).Methods("POST")
	router.HandleFunc("/search", GetSearch).Methods("POST")
	router.HandleFunc("/del", DeleteItem).Methods("POST")
	router.HandleFunc("/insert", Insert).Methods("POST")
	router.PathPrefix("/static/").Handler(s)

	log.Println("Listening...")
	// Запуск локального сервека на 8080 порту
	log.Fatal(http.ListenAndServe(":8080", router))
}
