function loadFonts() {
    const fonts = [
        new FontFace('SFThonburiLight', 'url(assets/fonts/SFThonburi.woff)'),
        new FontFace('SFThonburiRegular', 'url(assets/fonts/SFThonburi-Regular.woff)'),
        new FontFace('SFThonburiSemiBold', 'url(assets/fonts/SFThonburi-Semibold.woff)'),
        new FontFace('SFThonburiBold', 'url(assets/fonts/SFThonburi-Bold.woff)'),
        new FontFace('SFThonburiExtraBold', 'url(assets/fonts/SFThonburi-Bold-ExtraBold.woff)')
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
    
    const dt2 = document.getElementById('datetime2');
    if(dt2) dt2.value = formattedDateTime;

    const oneMinuteLater = new Date(now.getTime() + 60000);
    const hours = oneMinuteLater.getHours().toString().padStart(2, '0');
    const minutes = oneMinuteLater.getMinutes().toString().padStart(2, '0');
    const formattedTimePlusOne = `${hours}:${minutes}`;
    
    const dtPlusOne = document.getElementById('datetime_plus_one');
    if(dtPlusOne) dtPlusOne.value = formattedTimePlusOne;
}

function padZero(number) {
    return number < 10 ? '0' + number : number;
}

function formatDateWithDay(date) {
    const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    
    const dayName = days[new Date(date).getDay()];
    const day = new Date(date).getDate();
    const month = months[new Date(date).getMonth()];

    return `${dayName}ที่ ${day} ${month}`;
}

function formatDate(date) {
    const day = padZero(new Date(date).getDate());
    const month = padZero(new Date(date).getMonth() + 1);
    const year = "20" + new Date(date).getFullYear().toString().substr(-2);
    return `${day}/${month}/${year}`;
}

let qrCodeImage = null;
let powerSavingMode = false;

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
    const batteryLevel = document.getElementById('battery')?.value || '100';
    const datetimePlusOne = document.getElementById('datetime_plus_one')?.value || '-';
    const senderaccount = document.getElementById('senderaccount')?.value || '-';
    const backgroundSelect = document.getElementById('backgroundSelect')?.value || '';

    const senderaccount1 = document.getElementById('senderaccount1')?.value || '-';
    const name1 = document.getElementById('name1')?.value || '-';
    const bank1 = document.getElementById('bank1')?.value || '-';
    const money01 = document.getElementById('money01')?.value || '-';
    const remaining1 = document.getElementById('remaining1')?.value || '-';
    const datetime = document.getElementById('datetime')?.value || '-';

    const senderaccount2 = document.getElementById('senderaccount2')?.value || '-';
    const name2 = document.getElementById('name2')?.value || '-';
    const bank2 = document.getElementById('bank2')?.value || '-';
    const money02 = document.getElementById('money02')?.value || '-';
    const remaining2 = document.getElementById('remaining2')?.value || '-';
    const datetime2 = document.getElementById('datetime2')?.value || '-';

    const formattedDate1 = formatDate(datetime.substring(0, 10));
    const formattedTime1 = datetime.substring(11, 16);

    const formattedDate2 = formatDate(datetime2.substring(0, 10));
    const formattedTime2 = datetime2.substring(11, 16);

    const formattedTimePlusOne = datetimePlusOne;

    const canvas = document.getElementById('canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');

    const backgroundImage = new Image();
    backgroundImage.src = backgroundSelect;
    backgroundImage.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

        drawText(ctx, `${formattedTimePlusOne}`, 98, 49, 23, 'SFThonburiSemiBold', '#ffffff', 'center', 1.5, 3, 0, 0, 800, -0.25);

        drawText(ctx, `รายการเงินเข้า`, 85.7, 200.9, 22.3, 'SFThonburiSemiBold', '#3d3d3d', 'left', 1.5, 3, 0, 0, 1250, 0);
        drawText(ctx, `+${money01} บาท`, 85.7, 238, 25, 'SFThonburiBold', '#881cff', 'left', 1.5, 3, 0, 0, 1250,0);
        drawText(ctx, `${name1} ${senderaccount1}`, 453.5, 283.8, 19.4, 'SFThonburiSemiBold', '#3d3d3d', 'right', 1.5, 3, 0, 0, 1250, -1);
        drawText(ctx, `${bank1}`, 453.5, 316, 19.4, 'SFThonburiSemiBold', '#3d3d3d', 'right', 1.5, 3, 0, 0, 1250, -1);
        drawText(ctx, `${senderaccount}`, 453.5, 353.5, 19.4, 'SFThonburiSemiBold', '#3d3d3d', 'right', 1.5, 3, 0, 0, 1250, -1);
        drawText(ctx, `${formattedDate1} ${formattedTime1}`, 453.5, 391.5, 19.4, 'SFThonburiSemiBold', '#3d3d3d', 'right', 1.5, 3, 0, 0, 1250, -1);
        drawText(ctx, `${remaining1} บาท`, 453.5, 438, 19.4, 'SFThonburiSemiBold', '#3d3d3d', 'right', 1.5, 3, 0, 0, 1250, -1);

        drawText(ctx, `${formattedTime1}`, 483, 610, 13, 'SFThonburiRegular', '#1b3422', 'left', 1.5, 3, 0, 0, 1250, -0.25);

        drawText(ctx, `รายการเงินเข้า`, 85.7, 734, 22.3, 'SFThonburiSemiBold', '#3d3d3d', 'left', 1.5, 3, 0, 0, 1250, 0);
        drawText(ctx, `+${money02} บาท`, 85.7, 770, 25, 'SFThonburiBold', '#881cff', 'left', 1.5, 3, 0, 0, 1250,0);
        drawText(ctx, `${name2} ${senderaccount2}`, 453.5, 817, 19.4, 'SFThonburiSemiBold', '#3d3d3d', 'right', 1.5, 3, 0, 0, 1250, -1);
        drawText(ctx, `${bank2}`, 453.5, 848.7, 19.4, 'SFThonburiSemiBold', '#3d3d3d', 'right', 1.5, 3, 0, 0, 1250, -1);
        drawText(ctx, `${senderaccount}`, 453.5, 886.8, 19.4, 'SFThonburiSemiBold', '#3d3d3d', 'right', 1.5, 3, 0, 0, 1250, -1);
        drawText(ctx, `${formattedDate2} ${formattedTime2}`, 453.5, 924.9, 19.4, 'SFThonburiSemiBold', '#3d3d3d', 'right', 1.5, 3, 0, 0, 1250, -1);
        drawText(ctx, `${remaining2} บาท`, 453.5, 971, 19.4, 'SFThonburiSemiBold', '#3d3d3d', 'right', 1.5, 3, 0, 0, 1250, -1);

        drawText(ctx, `${formattedTime2}`, 483, 1142, 13, 'SFThonburiRegular', '#1b3422', 'left', 1.5, 3, 0, 0, 1250, -0.25);

        if (qrCodeImage) {
            ctx.drawImage(qrCodeImage, 0, 130.3, 555, 951); 
        }

        drawBattery(ctx, batteryLevel, powerSavingMode);
    };
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
        const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' });
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
            lines.push(currentLine.trimStart()); 
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

    const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
    const characters = [...segmenter.segment(text)].map(segment => segment.segment);
    let currentPosition = x;

    characters.forEach((char) => {
        ctx.fillText(char, currentPosition, y);
        const charWidth = ctx.measureText(char).width;
        currentPosition += charWidth + letterSpacing;
    });
}

function drawBattery(ctx, batteryLevel, powerSavingMode) {
    ctx.lineWidth = 2; 
    ctx.strokeStyle = '#9b9b9b'; 
    ctx.fillStyle = '#ffffff'; 

    let batteryColor = '#ffffff'; 
    if (batteryLevel <= 20) {
        batteryColor = '#ff0000'; 
    } else if (powerSavingMode) {
        batteryColor = '#fccd0e'; 
    }

    const fillWidth = (batteryLevel / 100) * 33.5; 
    const x = 498.5;
    const y = 32.5;
    const height = 14.5;
    const radius = 5; 

    ctx.fillStyle = batteryColor; 

    ctx.beginPath(); 
    ctx.moveTo(x, y + radius); 
    ctx.lineTo(x, y + height - radius); 
    ctx.arcTo(x, y + height, x + radius, y + height, radius); 
    ctx.lineTo(x + fillWidth - radius, y + height); 
    ctx.arcTo(x + fillWidth, y + height, x + fillWidth, y + height - radius, radius); 
    ctx.lineTo(x + fillWidth, y + radius); 
    ctx.arcTo(x + fillWidth, y, x + fillWidth - radius, y, radius); 
    ctx.lineTo(x + radius, y); 
    ctx.arcTo(x, y, x, y + radius, radius); 
    ctx.closePath(); 
    ctx.fill(); 
}

window.togglePowerSavingMode = function() {
    powerSavingMode = !powerSavingMode;
    const powerSavingButton = document.getElementById('powerSavingMode');
    if(powerSavingButton) powerSavingButton.classList.toggle('active', powerSavingMode);
    updateDisplay();
}

window.updateBatteryDisplay = function() {
    const batteryLevel = document.getElementById('battery')?.value || '100';
    const bl = document.getElementById('battery-level');
    if(bl) bl.innerText = batteryLevel;
}

window.downloadImage = function() {
    const canvas = document.getElementById('canvas');
    if(!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'slip_scb4.png';
    link.click();
}

const genBtn = document.getElementById('generate');
if(genBtn) {
    genBtn.addEventListener('click', updateDisplay);
}

function drawImage(ctx, imageUrl, x, y, width, height) {
    const image = new Image();
    image.src = imageUrl;
    image.onload = function() {
        ctx.drawImage(image, x, y, width, height);
    };
}