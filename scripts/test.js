function fadeIn(element) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(10px)';
    element.style.transition = '0.4s ease';

    requestAnimationFrame(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    });
}

function createImage(src) {
    let img = document.createElement('img');
    img.src = `images/${src}`;
    return img;
}

function createLink(icon, name, href) {
    let p = document.createElement('p');
    p.classList.add('link');
    
    let img = createImage(icon);
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

function createParagraph(className, text) {
    let p = document.createElement('p');
    p.className = className;
    p.innerHTML = text;
    return p;
}

function createSpoiler(className, textSummary, textDetails) {
    let details = document.createElement('details');

    let summary = document.createElement('summary');
    summary.textContent = textSummary;
    details.appendChild(summary);

    let p = createParagraph(className, textDetails);
    details.appendChild(p);

    return details;
}

function createButton(text) {
    let btnWrapper = document.createElement('div');
    btnWrapper.className = 'btn-wrapper';

    let button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;

    btnWrapper.appendChild(button);
    return btnWrapper;
}

function createRadioGroup(i, q) {
    let radioGroup = document.createElement('div');
    radioGroup.classList.add('block');
    
    if (q.description) {
        let description = createSpoiler('description',
            '👀 Подсказка', q.description);
        radioGroup.appendChild(description);
    }

    let question = createParagraph('question', q.question);
    radioGroup.appendChild(question);

    let explanation = createSpoiler('explanation',
        '💡', q.explanation);
    if (q.explanation_media) {
        let explanationMedia = createImage(q.explanation_media);
        explanation.appendChild(explanationMedia);
    }
    explanation.style.display = 'none';
    explanation.id = `q${i}expl`;
    radioGroup.appendChild(explanation);

    q.answers.split('\n').forEach((answer, j) => {
        let radioLine = document.createElement('label');
        radioLine.className = 'radio-line';

        let radio = document.createElement('input');
        radio.type = q.multiple ? 'checkbox' : 'radio';
        radio.name = `q${i}`;
        radio.value = j;
        if (!q.multiple) // переключатели
            radio.onclick = () => sendAnswer(i, j);
        radioLine.appendChild(radio);
        
        let percent = document.createElement('span');
        percent.id = `q${i}a${j}percent`;
        radioLine.appendChild(percent);

        let textAnswer = document.createElement('span');
        textAnswer.innerHTML = answer;
        radioLine.appendChild(textAnswer);
        
        let quantity = document.createElement('span');
        quantity.id = `q${i}a${j}quantity`;
        radioLine.appendChild(quantity);

        radioGroup.appendChild(radioLine);
    });
    
    if (q.multiple) { // флажки
        let button = createButton('Ответить');
        button.id = `q${i}button`;
        button.onclick = () => {
            let flags = 0;
            let radios = document.getElementsByName(`q${i}`);
            let size = radios.length;
            for (let j = 0; j < size; j++) {
                flags -= radios[j].checked << (size - 1 - j);
            }
            if (flags < 0)
                sendAnswer(i, flags);
        };
        radioGroup.appendChild(button);
    }

    return radioGroup;
}

function showQuestions() {
    list.innerHTML = '';
    list.style.display = 'none';
    
    let formData = new FormData();
    formData.append('test', testId);

    fetch('index.php?action=get_questions', { method: 'POST', body: formData })
        .then(response => response.json())
        .then(questions => buildQuestions(questions, formData));
}

function buildQuestions(questions, formData) {
    form.innerHTML = '';
    
    fetch('index.php?action=get_test', { method: 'POST', body: formData })
        .then(response => response.json())
        .then(test => {
            if (test.name) {
                form.style.display = 'block';
                
                let links = document.createElement('div');
                links.classList.add('block');
                links.innerHTML = '<p class="question">Ссылки на проповедь:</p>';
                if (test.vkvideo)
                    links.appendChild(createLink('vk.png', 'ВК Видео', test.vkvideo));
                if (test.youtube)
                    links.appendChild(createLink('youtube.png', 'Ютуб', test.youtube));
                if (test.presentation)
                    links.appendChild(createLink('presentation.png', 'Презентация', `pdf/${test.presentation}`));
                if (test.printout)
                    links.appendChild(createLink('printout.png', 'Распечатка', `pdf/${test.printout}`));
                form.appendChild(links);

                questions.forEach((q, i) => {
                    form.appendChild(createRadioGroup(i, q));
                    if (q.answer !== undefined)
                        checkAnswers(i, q.answer, q.right_answer);
                });
            }
        });

    fadeIn(form);
}

function sendAnswer(question, answer) {
    let formData = new FormData();
    formData.append('test', testId);
    formData.append('question', question);
    formData.append('answer', answer);

    fetch('index.php?action=send_answer', { method: 'POST', body: formData })
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
    let radios = document.getElementsByName(`q${question}`);
    let size = radios.length;
    for (let i = 0; i < size; i++) {
        radios[i].checked = checkEqual(i, answer, size);
        let color = checkEqual(i, right_answer, size) ? 'green' : 'red';
        radios[i].style.backgroundColor = color;
        radios[i].disabled = true;
        let formData = new FormData();
        formData.append('test', testId);
        formData.append('question', question);
        formData.append('i', i);
        if (right_answer < 0) // флажки
            formData.append('size', size);
        fetch('index.php?action=get_statistics', { method: 'POST', body: formData })
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

let form = document.getElementById('form');
let list = document.getElementById('list');

let params = new URLSearchParams(document.location.search);
let testId = params.get('testid');
if (!testId) {
    list.innerHTML = '<p class="question">Выберите тест:</p>';

    fetch('index.php?action=get_tests')
        .then(response => response.json())
        .then(tests => tests.forEach(t =>
            list.appendChild(createLink('test.png', t.name, `?testid=${t.id}`))));
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
