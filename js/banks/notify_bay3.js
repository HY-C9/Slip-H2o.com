function loadFonts() {
    const fonts = [
        new FontFace('SFThonburiLight', 'url(assets/fonts/SFThonburi.woff)'),
        new FontFace('SFThonburiRegular', 'url(assets/fonts/SFThonburi-Regular.woff)'),
        new FontFace('SFThonburiSemiBold', 'url(assets/fonts/SFThonburi-Semibold.woff)'),
        new FontFace('SFThonburiBold', 'url(assets/fonts/SFThonburi-Bold.woff)'),
        new FontFace('krungsriRegular', 'url(assets/fonts/krungsri_con-webfont.woff)'),
        new FontFace('krungsriMedium', 'url(assets/fonts/krungsri_con_med-webfont.woff)'),
        new FontFace('krungsriBold', 'url(assets/fonts/krungsri_con_bol-webfont.woff)')
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
    
    const formattedDateTime = localDateTime.replace(' ', 'T').substring(0, 16);
    const dt = document.getElementById('datetime');
    if(dt) dt.value = formattedDateTime;
    
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

function formatDate(dateString) {
    if (!dateString || dateString === '-') return '-';
    const d = new Date(dateString);
    if (isNaN(d)) return '-';
    
    const options = { day: 'numeric', month: 'short', year: '2-digit' };
    let formattedDate = d.toLocaleDateString('th-TH', options);
    formattedDate = formattedDate.replace(/ /g, ' ').replace(/\./g, '');
    
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const day = padZero(formattedDate.split(' ')[0]);
    const month = months[d.getMonth()];
    let year = formattedDate.split(' ')[2];
    year = `25${year}`;
    return `${day} ${month} ${year}`;
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
    let backgroundSelect = document.getElementById('backgroundSelect')?.value;
    if (!backgroundSelect || backgroundSelect === '') {
        backgroundSelect = 'assets/image/bs/backgroundEnter-BAY2.jpg'; 
    }

    const datetime = document.getElementById('datetime')?.value || '-';
    const datetimePlusOne = document.getElementById('datetime_plus_one')?.value || '-';
    const batteryLevel = document.getElementById('battery')?.value || '100';
    const money01 = document.getElementById('money01')?.value || '-';
    const money02 = document.getElementById('money02')?.value || '-';
    const senderaccount1 = document.getElementById('senderaccount1')?.value || '-';

    const formattedDate = formatDate(datetime);
    
    let formattedTime = '-';
    if(datetime !== '-' && !isNaN(new Date(datetime))) {
        const d = new Date(datetime);
        formattedTime = padZero(d.getHours()) + ':' + padZero(d.getMinutes()) + ':' + padZero(d.getSeconds());
    }

    const canvas = document.getElementById('canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');

    const drawAllContent = (bgImg) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (bgImg) {
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        drawText(ctx, `${datetimePlusOne}`, 94, 52, 26, 'SFThonburiSemiBold', '#000000', 'center', 1.5, 3, 0, 0, 800, -0.50);

        drawText(ctx, `รายการเงินเข้า`, 40.7, 445.2, 30, 'krungsriBold', '#000000', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${formattedDate} ${formattedTime}  `, 40.7, 486, 24, 'krungsriMedium', '#3e3e3e', 'left', 24, 3, 0, 0, 800, 0);

        // กลับมาใช้ระยะบรรทัด 42 เท่าต้นฉบับครับ (พอบั๊กเบิ้ลบรรทัดหาย ระยะจะกลับมาพอดีเป๊ะ)
        drawText(ctx, `มีเงินเข้า ${senderaccount1}<br>จำนวน ${money01} บาท<br>ยอดเงินคงเหลือที่ใช้ได้ ${money02} บาท`, 40.7, 574, 24, 'krungsriMedium', '#3e3e3e', 'left', 42, 3, 0, 0, 800, 0);

        if (qrCodeImage) {
            ctx.drawImage(qrCodeImage, 0, 130.3, 555, 951); 
        }

        drawBattery(ctx, batteryLevel, powerSavingMode);
    };

    const backgroundImage = new Image();
    backgroundImage.src = backgroundSelect; 
    
    backgroundImage.onload = function() {
        drawAllContent(backgroundImage);
    };

    backgroundImage.onerror = function() {
        drawAllContent(null); 
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
        // เอาตัวปัญหาที่ทำให้เกิดการเบิ้ลระยะบรรทัด (Double line-height) ออกแล้วครับ
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

    let batteryColor = '#28bf2b'; 
    if (batteryLevel <= 20) {
        batteryColor = '#ff0000'; 
    } else if (powerSavingMode) {
        batteryColor = '#fccd0e'; 
    }

    const fillWidth = (batteryLevel / 100) * 37.5; 
    const x = 500.5;
    const y = 34.5;
    const height = 19.0;
    const radius = 6; 

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

    drawText(ctx, `${batteryLevel}`, x + 37 / 2, y + height / 1.25, 17, 'SFThonburiBold', '#000000', 'center', 1, 1, 0, 0, 100, 0);
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
    link.download = 'slip_bay_white.png';
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