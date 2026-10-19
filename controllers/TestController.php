<?php
require_once 'models/TestModel.php';

class TestController {
    private $model;
    
    private function getSessionId() {
        session_set_cookie_params(time() + 365 * 24 * 3600);
        session_start();
        return session_id();
    }

    private function echoJson($arr) {
        header('Content-Type: application/json');
        echo json_encode($arr,
            JSON_UNESCAPED_UNICODE | JSON_NUMERIC_CHECK);
    }

    public function __construct() {
        $this->model = new TestModel();
    }

    public function renderIndex() {
        include 'views/TestView.php';
    }

    public function getTitle() {
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
    
    public function getTests() {
        $this->echoJson($this->model->getTests());
    }
    
    public function getTest() {
        if (isset($_POST['test'])) {
            $test = intval($_POST['test']);
            $this->echoJson($this->model->getTest($test));
        }
    }
    
    public function getQuestions() {
        if (isset($_POST['test'])) {
            $test = intval($_POST['test']);
            $sessid = $this->getSessionId();
            $this->echoJson($this->model->getQuestions($test, $sessid));
        }
    }
    
    public function getStatistics() {
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
            $this->echoJson($this->model->getStatistics($test, $question, $i, $size, $multiple));
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
