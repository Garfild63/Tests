<?php
    require_once 'controllers/TestController.php';

    $controller = new TestController();

    // Обработка действий
    $action = isset($_GET['action']) ? $_GET['action'] : 'index';
    switch ($action) {
        case 'index':
            $controller->renderIndex();
            break;
        case 'get_tests':
            $controller->getTests();
            break;
        case 'get_test':
            $controller->getTest();
            break;
        case 'get_questions':
            $controller->getQuestions();
            break;
        case 'get_statistics':
            $controller->getStatistics();
            break;
        case 'send_answer':
            $controller->sendAnswer();
            break;
    }
?>
