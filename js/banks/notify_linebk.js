function loadFonts() {
    const fonts = [
        new FontFace('SFThonburiLight', 'url(assets/fonts/SFThonburi.woff)'),
        new FontFace('SFThonburiRegular', 'url(assets/fonts/SFThonburi-Regular.woff)'),
        new FontFace('SFThonburiSemiBold', 'url(assets/fonts/SFThonburi-Semibold.woff)'),
        new FontFace('SFThonburiBold', 'url(assets/fonts/SFThonburi-Bold.woff)')
    ];

    return Promise.allSettled(fonts.map(font => font.load())).then(function(loadedFonts) {
        loadedFonts.forEach(function(result) {
            if (result.status === 'fulfilled') {
                document.fonts.add(result.value);
            }
        });
    });
}

window.onload = function() {
    setCurrentDateTime();
    loadFonts().then(function() {
        document.fonts.ready.then(function() {
            updateDisplay(); 
        });
    }).catch(function() {
        updateDisplay();
    });
};

function setCurrentDateTime() {
    const now = new Date();
    const localDateTime = now.toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok', hour12: false });
    
    const formattedDateTime = localDateTime.substring(0, 16); 
    const dt = document.getElementById('datetime');
    if(dt) dt.value = formattedDateTime;
    
    const oneMinuteLater = new Date(now.getTime() + 60000); 
    const hours = padZero(oneMinuteLater.getHours());
    const minutes = padZero(oneMinuteLater.getMinutes());
    const formattedTimePlusOne = `${hours}:${minutes}`;
    const dtPlusOne = document.getElementById('datetime_plus_one');
    if(dtPlusOne) dtPlusOne.value = formattedTimePlusOne;
}

function padZero(number) {
    return number < 10 ? '0' + number : number;
}

function formatDate(date) {
    const options = { day: 'numeric', month: 'short', year: '2-digit' };
    let formattedDate = new Date(date).toLocaleDateString('th-TH', options);
    formattedDate = formattedDate.replace(/ /g, ' ').replace(/\./g, '');
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const day = parseInt(formattedDate.split(' ')[0]); 
    const month = months[new Date(date).getMonth()];
    const year = formattedDate.split(' ')[2];
    return `${day} ${month} ${year}`;
}

let qrCodeImage = null;

window.handlePaste = function(event) {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    qrCodeImage = img;
                    updateDisplay();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(blob);
        }
    }
}

window.updateDisplay = function() {
    const datetime = document.getElementById('datetime')?.value || '-';
    const datetimePlusOne = document.getElementById('datetime_plus_one')?.value || '-';
    const money01 = document.getElementById('money01')?.value || '-';
    const senderaccount1 = document.getElementById('senderaccount1')?.value || '-';
    
    let formattedDate = '-';
    let formattedTime = '-';
    if(datetime !== '-' && !isNaN(new Date(datetime))) {
        formattedDate = formatDate(datetime.substring(0, 10)); 
        formattedTime = datetime.substring(11, 16); 
    }
    const formattedTimePlusOne = datetimePlusOne; 

    const canvas = document.getElementById('canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');

    const drawAllContent = (bgImg) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (bgImg) {
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff6b6b';
            ctx.font = '20px Kanit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('❌ หาภาพพื้นหลังไม่เจอ', canvas.width / 2, canvas.height / 2 - 20);
            ctx.fillStyle = '#06c755';
            ctx.font = '16px Kanit, sans-serif';
            ctx.fillText('ตรวจสอบไฟล์: assets/image/bs/backgroundEnter-BK1.jpg', canvas.width / 2, canvas.height / 2 + 10);
        }

        drawText(ctx, `${money01}`, 57, 277.8, 59, 'SFThonburiBold', '#414141', 'left', 1.5, 3, 0, 0, 1250, -3);
        const accountNameWidth = ctx.measureText(`${money01}`).width;
        drawText(ctx, `บาท`, 57 + accountNameWidth, 277.8, 59, 'SFThonburiBold', '#414141', 'left', 40, 3, 0, 0, 1250, 0);

        drawText(ctx, `รับโอนเงิน`, 57, 335.7, 46, 'SFThonburiBold', '#414141', 'left', 1.5, 3, 0, 0, 1250, 1);

        drawText(ctx, `${formattedDate} ${formattedTime}`, 55, 401.2, 25, 'SFThonburiSemiBold', '#b8b8b8', 'left', 1.5, 3, 0, 0, 1250, -0.25);

        drawText(ctx, `บัญชี`, 585.7, 516.6, 27.50, 'SFThonburiSemiBold', '#6d6d6d', 'right', 1.5, 3, 0, 0, 1250, -0.25);
        drawText(ctx, `หลัก(${senderaccount1})`, 585.7, 554.9, 27.50, 'SFThonburiSemiBold', '#6d6d6d', 'right', 1.5, 3, 0, 0, 1250, -0.25);
        drawText(ctx, `Other`, 585.7, 611.1, 27.50, 'SFThonburiSemiBold', '#6d6d6d', 'right', 1.5, 3, 0, 0, 1250, -0.25);

        drawText(ctx, `${formattedTimePlusOne} น.`, 621.9, 816.3, 20, 'SFThonburiSemiBold', '#908478', 'right', 1.5, 3, 0, 0, 800, -0.25);

        if (qrCodeImage) {
            ctx.drawImage(qrCodeImage, 0, 130.3, 555, 951); 
        }
    };

    const backgroundImage = new Image();
    backgroundImage.src = 'assets/image/bs/backgroundEnter-BK1.jpg';
    
    backgroundImage.onload = function() {
        drawAllContent(backgroundImage);
    };

    backgroundImage.onerror = function() {
        drawAllContent(null);
    }
}

function drawText(ctx, text, x, y, fontSize, fontFamily, color, align, lineHeight, maxLines, shadowColor, shadowBlur, maxWidth, letterSpacing) {
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.shadowColor = shadowColor || 'transparent';
    ctx.shadowBlur = shadowBlur || 0;

    const paragraphs = text.split('<br>');
    let currentY = y;

    paragraphs.forEach(paragraph => {
        const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
        const words = [...segmenter.segment(paragraph)].map(segment => segment.segment);

        let lines = [];
        let currentLine = '';

        words.forEach((word) => {
            const testLine = currentLine + word;
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width + (testLine.length - 1) * letterSpacing;

            if (testWidth > maxWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });
        if (currentLine) {
            lines.push(currentLine);
        }

        lines.forEach((line, index) => {
            let currentX = x;

            if (align === 'center') {
                currentX = x - (ctx.measureText(line).width / 2) - ((line.length - 1) * letterSpacing) / 2;
            } else if (align === 'right') {
                currentX = x - ctx.measureText(line).width - ((line.length - 1) * letterSpacing);
            }

            drawTextLine(ctx, line, currentX, currentY, letterSpacing);
            currentY += lineHeight;
            if (maxLines && index >= maxLines - 1) {
                return;
            }
        });

        currentY += lineHeight;
    });
}

function drawTextLine(ctx, text, x, y, letterSpacing) {
    if (!letterSpacing) {
        ctx.fillText(text, x, y);
        return;
    }

    const characters = text.split('');
    let currentPosition = x;

    characters.forEach((char) => {
        ctx.fillText(char, currentPosition, y);
        const charWidth = ctx.measureText(char).width;
        currentPosition += charWidth + letterSpacing;
    });
}

window.downloadImage = function() {
    const canvas = document.getElementById('canvas');
    if(!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'slip_linebk.png';
    link.click();
}

const genBtn = document.getElementById('generate');
if(genBtn) {
    genBtn.addEventListener('click', updateDisplay);
}