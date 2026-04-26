function loadFonts() {
    const fonts = [
        new FontFace('SFThonburiLight', 'url(assets/fonts/SFThonburi.woff)'),
        new FontFace('SFThonburiRegular', 'url(assets/fonts/SFThonburi-Regular.woff)'),
        new FontFace('SFThonburiSemiBold', 'url(assets/fonts/SFThonburi-Semibold.woff)'),
        new FontFace('SFThonburiBold', 'url(assets/fonts/SFThonburi-Bold.woff)'),
        new FontFace('DXTTBBold', 'url(assets/fonts/DX-TTB-bold.woff)'),
        new FontFace('DXTTBRegular', 'url(assets/fonts/DX-TTB-regular.woff)')
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

    const fiveMinutesEarlier = new Date(now.getTime() - 240000); 
    const formattedDateTime1 = fiveMinutesEarlier.toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok', hour12: false }).substring(0, 16);
    const dt1 = document.getElementById('datetime1');
    if(dt1) dt1.value = formattedDateTime1;

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
    
    // === แก้ไขตรงนี้ === 
    // แทนที่จะดึงปีปฏิทินจริง (.substr(-2) ซึ่งจะได้ 26) ให้ตั้งค่าเป็น '69' เลยตามคำขอ
    // หรือถ้าต้องการบวกปีเป็น พ.ศ. 2569 จะได้ 69 พอดี (ขึ้นอยู่กับระบบเครื่อง)
    // ผมขอบังคับเป็น 69 ไปเลย เพื่อความชัวร์ที่สุดครับ
    const year = "69"; 
    
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
    const backgroundSelect = document.getElementById('backgroundSelect')?.value || '';

    const datetime = document.getElementById('datetime')?.value || '-';
    const datetime1 = document.getElementById('datetime1')?.value || '-';
    const datetimePlusOne = document.getElementById('datetime_plus_one')?.value || '-';
    const batteryLevel = document.getElementById('battery')?.value || '100';
    const money01 = document.getElementById('money01')?.value || '-';
    const senderaccount2 = document.getElementById('senderaccount2')?.value || '-';
    const money02 = document.getElementById('money02')?.value || '-';

    const nametext1 = document.getElementById('nametext1')?.value || '-';
    const text1 = document.getElementById('text1')?.value || '-';
    
    const formattedDate = formatDate(datetime.substring(0, 10)); 
    const formattedDateWithDay = formatDateWithDay(datetime.substring(0, 10)); 
    const formattedTime = datetime.substring(11, 16); 
    const formattedTime1 = datetime1.substring(11, 16); 
    const formattedTimePlusOne = datetimePlusOne; 

    let timeDifference = Math.floor((new Date(`1970-01-01T${datetimePlusOne}:00Z`) - new Date(`1970-01-01T${formattedTime}:00Z`)) / 60000);
    let timeMessage = "";
    
    if (timeDifference > 1) {
        timeMessage = `${timeDifference} นาทีที่แล้ว`;
    } else if (timeDifference === 1) {
        timeMessage = "1 นาทีที่แล้ว";
    } else {
        timeMessage = "ตอนนี้";
    }
    
    let timeDifference2 = Math.floor((new Date(`1970-01-01T${formattedTimePlusOne}:00Z`) - new Date(`1970-01-01T${formattedTime1}:00Z`)) / 60000);
    let timeMessage2 = "";

    if (timeDifference2 >= 60) {
        let hours = Math.floor(timeDifference2 / 60);
        timeMessage2 = `${hours} ชั่วโมงที่แล้ว`;
    } else if (timeDifference2 > 1) {
        timeMessage2 = `${timeDifference2} นาทีที่แล้ว`;
    } else if (timeDifference2 === 1) {
        timeMessage2 = "1 นาทีที่แล้ว";
    } else {
        timeMessage2 = "ตอนนี้";
    }

    const bank1 = document.getElementById('bank1')?.value || '-';
    const senderaccount1 = document.getElementById('senderaccount1')?.value || '-';
    const name1 = document.getElementById('name1')?.value || '-';
    
    const canvas = document.getElementById('canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');

    const drawAllContent = (bgImg) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if(bgImg) {
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff6b6b';
            ctx.font = '20px Kanit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('❌ หาภาพพื้นหลังไม่เจอ', canvas.width / 2, canvas.height / 2 - 20);
            ctx.fillStyle = '#1e3a8a';
            ctx.font = '16px Kanit, sans-serif';
            ctx.fillText('ตรวจสอบไฟล์: assets/image/bs/backgroundEnter-T3.jpg', canvas.width / 2, canvas.height / 2 + 10);
        }

        drawText(ctx, `${formattedTimePlusOne}`, 98, 49.5, 25, 'SFThonburiBold', '#000000', 'center', 1.5, 3, 0, 0, 800, 0);

        drawText(ctx, `${senderaccount2}`, 542, 495.4, 20, 'DXTTBRegular', '#193672', 'right', 35, 3, 0, 0, 490, 0);
        drawText(ctx, `${bank1} ${senderaccount1} ${name1}`, 542, 550.1, 20, 'DXTTBRegular', '#193672', 'right', 35, 3, 0, 0, 490, 0);
        drawText(ctx, `${money01}`, 542, 604.8, 20, 'DXTTBRegular', '#193672', 'right', 35, 3, 0, 0, 490, 0);
        drawText(ctx, `${money02}`, 542, 660.1, 20, 'DXTTBRegular', '#193672', 'right', 35, 3, 0, 0, 490, 0);
        drawText(ctx, `${formattedDate}, ${formattedTime} น.`, 542, 715, 19.50, 'DXTTBRegular', '#193672', 'right', 35, 3, 0, 0, 490, -0.25);

        if (qrCodeImage) {
            ctx.drawImage(qrCodeImage, 0, 130.3, 555, 951); 
        }

        drawBattery(ctx, batteryLevel, powerSavingMode);
    };

    const backgroundImage = new Image();
    backgroundImage.src = 'assets/image/bs/backgroundEnter-T3.jpg';
    
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

    let batteryColor = '#000000'; 
    if (batteryLevel <= 20) {
        batteryColor = '#ff0000'; 
    } else if (powerSavingMode) {
        batteryColor = '#fccd0e'; 
    }

    const fillWidth = (batteryLevel / 100) * 38.5; 
    const x = 508.5;
    const y = 28.0;
    const height = 21.0;
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

    drawText(ctx, `${batteryLevel}`, x + 37.8 / 2, y + height / 1.25, 18, 'SFThonburiSemiBold', '#ffffff', 'center', 1, 1, 0, 0, 800, 0);
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
    link.download = 'slip_ttb3.png';
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