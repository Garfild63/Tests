<?php
class TestModel {
    private $db;

    public function __construct() {
        $sqlhost = 'localhost';
        $sqluser = 'root';
        $sqlpass = 'root';
        $bd = 'database';

        // Подключение к базе данных
        $this->db = mysqli_connect($sqlhost, $sqluser, $sqlpass, $bd);
        if (!$this->db) {
            die('Ошибка: ' . mysqli_connect_error());
        }
    }
    
    public function getTests() {
        $result = mysqli_query($this->db, "SELECT id, name FROM Tests67 ORDER BY id DESC");
        return mysqli_fetch_all($result, MYSQLI_ASSOC);
    }
    
    public function getTest($id) {
        $result = mysqli_query($this->db, "SELECT name, vkvideo, youtube, presentation, printout FROM Tests67 WHERE id = $id");
        return mysqli_fetch_assoc($result);
    }

    public function getQuestions($test, $sessid) {
        $result1 = mysqli_query($this->db, "SELECT question, description, explanation, explanation_media, answers, right_answer < 0 AS multiple FROM Questions67 WHERE test = $test");
        $arr1 = mysqli_fetch_all($result1, MYSQLI_ASSOC);
        
        $result2 = mysqli_query($this->db, "SELECT question, answer, right_answer FROM Results67 WHERE sessid = '$sessid' AND test = $test");
        $arr2 = mysqli_fetch_all($result2, MYSQLI_ASSOC);
        
        foreach ($arr2 as $el) {
            $arr1[$el['question']]['answer'] = $el['answer'];
            $arr1[$el['question']]['right_answer'] = $el['right_answer'];
        }
        return $arr1;
    }
    
    private function checkEqual($i, $size, $multiple) {
        if (!$multiple) { // переключатели
            return "answer = $i";
        } else { // флажки
            $one = 1 << ($size - 1 - $i);
            return "(-answer & $one) > 0";
        }
    }
    
    public function getStatistics($test, $question, $i, $size, $multiple) {
        $condition = $this->checkEqual($i, $size, $multiple);
        $result = mysqli_query($this->db, "SELECT (SELECT COUNT(*) FROM Results67 WHERE test = $test AND question = $question AND $condition), (SELECT COUNT(*) FROM Results67 WHERE test = $test AND question = $question)");
        return mysqli_fetch_row($result);
    }

    public function sendAnswer($test, $question, $answer, $sessid) {
        $result = mysqli_query($this->db, "SELECT right_answer FROM Questions67 WHERE test = $test");
        $arr = mysqli_fetch_all($result, MYSQLI_ASSOC);
        $rightans = $arr[$question]['right_answer'];
        
        mysqli_query($this->db, "INSERT INTO Results67 (sessid, test, question, answer, right_answer) VALUES ('$sessid', $test, $question, $answer, $rightans)");
        return $rightans;
    }

    public function __destruct() {
        mysqli_close($this->db);
    }
}
?>
