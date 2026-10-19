<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title><?php
        $title = $this->getTitle();
        echo $title;
    ?></title>
    <link rel="icon" href="images/favicon.png"/>
    <link rel="stylesheet" href="css/styles.css"/>
</head>
<body>
    <div class="particles"></div>

    <div class="container">
        <h1 class="title"><?php echo $title; ?></h1>
        <div id="list" class="card"></div>
        <form id="form" class="card"></form>
    </div>
    
    <script src="scripts/test.js"></script>
</body>
</html>
