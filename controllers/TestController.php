<?php
require_once 'models/TestModel.php';

class TestController {
    private $model;
    
    private function getTitle() {
        if (isset($_GET['testid'])) {
            $test = intval($_GET['testid']);
            $arr = $this->model->getTest($test);
            if (isset($arr['name'])) {
                $title = $arr['name'];
            } else {
                $title = 'Ошибка! Такого теста не существует';
            }
        } else {
            $title = 'Тесты по проповедям церкви "Дом Благодати"';
        }
        return $title;
    }
    
    private function getSessionId() {
        session_set_cookie_params(time() + 365 * 24 * 3600);
        session_start();
        return session_id();
    }

    public function __construct() {
        $this->model = new TestModel();
    }

    public function renderIndex() {
        include 'views/TestView.php';
    }

    public function getTests() {
        header('Content-Type: application/json');
        echo json_encode($this->model->getTests(), JSON_UNESCAPED_UNICODE | JSON_NUMERIC_CHECK);
    }
    
    public function getTest() {
        header('Content-Type: application/json');
        if (isset($_POST['test'])) {
            $test = intval($_POST['test']);
            echo json_encode($this->model->getTest($test), JSON_UNESCAPED_UNICODE | JSON_NUMERIC_CHECK);
        }
    }
    
    public function getQuestions() {
        header('Content-Type: application/json');
        if (isset($_POST['test'])) {
            $test = intval($_POST['test']);
            $sessid = $this->getSessionId();
            echo json_encode($this->model->getQuestions($test, $sessid), JSON_UNESCAPED_UNICODE | JSON_NUMERIC_CHECK);
        }
    }
    
    public function getStatistics() {
        header('Content-Type: application/json');
        if (isset($_POST['test'], $_POST['question'], $_POST['i'])) {
            $test = intval($_POST['test']);
            $question = intval($_POST['question']);
            $i = intval($_POST['i']);
            $size = -1;
            $multiple = false;
            if (isset($_POST['size'])) {
                $size = intval($_POST['size']);
                $multiple = true;
            }
            echo json_encode($this->model->getStatistics($test, $question, $i, $size, $multiple), JSON_UNESCAPED_UNICODE | JSON_NUMERIC_CHECK);
        }
    }
    
    public function sendAnswer() {
        if (isset($_POST['test'], $_POST['question'], $_POST['answer'])) {
            $test = intval($_POST['test']);
            $question = intval($_POST['question']);
            $answer = intval($_POST['answer']);
            $sessid = $this->getSessionId();
            echo $this->model->sendAnswer($test, $question, $answer, $sessid);
        }
    }
}
?>
