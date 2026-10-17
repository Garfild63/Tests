function createLink(icon, name, href) {
    let p = document.createElement('p');
    p.classList.add('link');
    
    let img = document.createElement('img');
    img.src = `images/${icon}`;
    img.width = 32;
    img.height = 32;
    p.appendChild(img);
    
    let a = document.createElement('a');
    a.textContent = name;
    a.href = href;
    p.appendChild(a);

    fadeIn(p);
    return p;
}

function fadeIn(element) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(10px)';
    element.style.transition = '0.4s ease';

    requestAnimationFrame(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    });
}

function showQuestions() {
    list.innerHTML = '';
    list.style.display = 'none';
    form.style.display = 'block';
    
    let dt = new FormData();
    dt.append('test', testId);

    fetch('index.php?action=get_questions', { method: 'POST', body: dt })
        .then(response => response.json())
        .then(questions => buildQuestions(questions, dt));
}

function buildQuestions(questions, dt) {
    form.innerHTML = '';
    
    let div = document.createElement('div');
    div.classList.add('block');
    div.innerHTML = '<p class="question">Ссылки на проповедь:</p>';
    fetch('index.php?action=get_test', { method: 'POST', body: dt })
        .then(response => response.json())
        .then(test => {
            if (test.vkvideo)
                div.appendChild(createLink('vk.png', 'ВК Видео', test.vkvideo));
            if (test.youtube)
                div.appendChild(createLink('youtube.png', 'Ютуб', test.youtube));
            if (test.presentation)
                div.appendChild(createLink('presentation.png', 'Презентация', `pdf/${test.presentation}`));
            if (test.printout)
                div.appendChild(createLink('printout.png', 'Распечатка', `pdf/${test.printout}`));
        });
    form.appendChild(div);

    questions.forEach((q, i) => {
        form.appendChild(createRadioGroup(i, q));
        if (q.answer !== undefined)
            checkAnswers(i, q.answer, q.right_answer);
    });

    fadeIn(form);
}

function createRadioGroup(i, q) {
    let div = document.createElement('div');
    div.classList.add('block');
    
    if (q.description) {
        let detailsDescr = document.createElement('details');
        let summaryDescr = document.createElement('summary');
        summaryDescr.textContent = '👀 Подсказка';
        detailsDescr.appendChild(summaryDescr);
        let pDescr = document.createElement('p');
        pDescr.className = 'description';
        pDescr.innerHTML = q.description;
        detailsDescr.appendChild(pDescr);
        div.appendChild(detailsDescr);
    }

    let pQuestion = document.createElement('p');
    pQuestion.className = 'question';
    pQuestion.innerHTML = q.question;
    div.appendChild(pQuestion);
    
    let detailsExpl = document.createElement('details');
    let summaryExpl = document.createElement('summary');
    summaryExpl.textContent = '💡';
    detailsExpl.appendChild(summaryExpl);
    let pExpl = document.createElement('p');
    pExpl.innerHTML = q.explanation;
    detailsExpl.appendChild(pExpl);
    if (q.explanation_media) {
        let imgExpl = document.createElement('img');
        imgExpl.src = `images/${q.explanation_media}`;
        detailsExpl.appendChild(imgExpl);
    }
    detailsExpl.style.display = 'none';
    detailsExpl.id = `q${i}expl`;
    div.appendChild(detailsExpl);

    q.answers.split('\n').forEach((answer, j) => {
        let label = document.createElement('label');
        label.className = 'radio-line';

        let radio = document.createElement('input');
        radio.type = q.multiple ? 'checkbox' : 'radio';
        radio.name = `q${i}`;
        radio.value = j;
        radio.id = `q${i}a${j}`;
        if (!q.multiple) // переключатели
            radio.onclick = () => sendAnswer(i, j);
        label.appendChild(radio);
        
        let span1 = document.createElement('span');
        span1.id = `q${i}a${j}percent`;
        label.appendChild(span1);

        let span2 = document.createElement('span');
        span2.innerHTML = answer;
        label.appendChild(span2);
        
        let span3 = document.createElement('span');
        span3.id = `q${i}a${j}quantity`;
        label.appendChild(span3);

        div.appendChild(label);
    });
    
    if (q.multiple) { // флажки
        let btn = createButton('Проголосовать');
        btn.id = `q${i}button`;
        btn.onclick = () => {
            let flags = 0;
            let size = document.getElementsByName(`q${i}`).length;
            for (let j = 0; j < size; j++) {
                flags -= document.getElementById(`q${i}a${j}`).checked << (size - 1 - j);
            }
            if (flags < 0)
                sendAnswer(i, flags);
        };
        div.appendChild(btn);
    }

    return div;
}

function sendAnswer(question, answer) {
    let dt = new FormData();
    dt.append('test', testId);
    dt.append('question', question);
    dt.append('answer', answer);

    fetch('index.php?action=send_answer', { method: 'POST', body: dt })
        .then(response => response.ok ? response.text() : null)
        .then(right_answer => checkAnswers(question, answer, right_answer));
}

function checkEqual(i, answer, size) {
    if (answer >= 0) { // переключатели
        return answer == i;
    } else { // флажки
        let one = 1 << (size - 1 - i);
        return (-answer & one) > 0;
    }
}

function checkAnswers(question, answer, right_answer) {
    let size = document.getElementsByName(`q${question}`).length;
    for (let i = 0; i < size; i++) {
        document.getElementById(`q${question}a${i}`).checked = checkEqual(i, answer, size);
        let color = checkEqual(i, right_answer, size) ? 'green' : 'red';
        document.getElementById(`q${question}a${i}`).style.backgroundColor = color;
        document.getElementById(`q${question}a${i}`).disabled = true;
        let dt = new FormData();
        dt.append('test', testId);
        dt.append('question', question);
        dt.append('i', i);
        if (right_answer < 0) // флажки
            dt.append('size', size);
        fetch('index.php?action=get_statistics', { method: 'POST', body: dt })
            .then(response => response.json())
            .then(arr => {
                document.getElementById(`q${question}a${i}percent`).innerHTML = Math.round(arr[0] / arr[1] * 100) + '%';
                document.getElementById(`q${question}a${i}quantity`).innerHTML = arr[0];
            });
    }
    if (right_answer < 0) // флажки
        document.getElementById(`q${question}button`).style.display = 'none';
    document.getElementById(`q${question}expl`).style.display = 'block';
    if (answer != right_answer)
        document.getElementById(`q${question}expl`).open = true;
}

function createButton(text) {
    let div = document.createElement('div');
    div.className = 'btn-wrapper';

    let btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = text;
    btn.onclick = () => sendAnswers();

    div.appendChild(btn);
    return div;
}

let form = document.getElementById('form');
let list = document.getElementById('list');

let params = new URLSearchParams(document.location.search);
let testId = params.get('testid');
if (!testId) {
    list.innerHTML = '<p class="question">Выберите тест:</p>';

    fetch('index.php?action=get_tests')
        .then(response => response.json())
        .then(tests => tests.forEach(t => list.appendChild(createLink('test.png', t.name, `?testid=${t.id}`))));
} else {
    showQuestions();
}

for (let i = 0; i < 400; i++) {
    let p = document.createElement('div');
    p.className = 'particle';

    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = (4 + Math.random() * 7) + 's';
    p.style.animationDelay = Math.random() * 10 + 's';
    p.style.opacity = Math.random();

    document.querySelector('.particles').appendChild(p);
}
