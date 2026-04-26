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
    updateMonthAndYear(); 

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

function updateMonthAndYear() {
    const today = new Date();
    const fullThaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

    const day = today.getDate(); 
    const fullMonth = fullThaiMonths[today.getMonth()]; 
    const year = today.getFullYear() + 543; 
    
    const monthMonthYear = `${day} ${fullMonth} ${year % 100}`;
    const mmyInput = document.getElementById('monthmonthyear');
    if(mmyInput) mmyInput.value = monthMonthYear;
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
    const datetime = document.getElementById('datetime')?.value || '-';
    const datetimePlusOne = document.getElementById('datetime_plus_one')?.value || '-';
    const receivername = document.getElementById('receivername')?.value || '-';
    const batteryLevel = document.getElementById('battery')?.value || '100';
    const money01 = document.getElementById('money01')?.value || '-';
    const receiveraccount = document.getElementById('receiveraccount')?.value || '-';
    
    let formattedDate = '-';
    let formattedDateWithDay = '-';
    let formattedTime = '-';
    
    if(datetime !== '-' && !isNaN(new Date(datetime))) {
        formattedDate = formatDate(datetime.substring(0, 10)); 
        formattedDateWithDay = formatDateWithDay(datetime.substring(0, 10)); 
        formattedTime = datetime.substring(11, 16); 
    }
    const formattedTimePlusOne = datetimePlusOne; 

    let timeDifference = Math.floor((new Date(`1970-01-01T${formattedTimePlusOne}:00Z`) - new Date(`1970-01-01T${formattedTime}:00Z`)) / 60000);
    let timeMessage = "";
    
    if (timeDifference >= 60) {
        let hours = Math.floor(timeDifference / 60);
        timeMessage = `${hours} ชั่วโมงที่แล้ว`;
    } else if (timeDifference > 1) {
        timeMessage = `${timeDifference} นาทีที่แล้ว`;
    } else if (timeDifference === 1) {
        timeMessage = "1 นาทีที่แล้ว";
    } else {
        timeMessage = "ตอนนี้";
    }

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
            ctx.fillStyle = '#4f46e5';
            ctx.font = '16px Kanit, sans-serif';
            ctx.fillText('ตรวจสอบไฟล์: assets/image/bs/backgroundEnter-Make1.jpg', canvas.width / 2, canvas.height / 2 + 10);
        }

        drawText(ctx, `   ${formattedDateWithDay}   `, 295, 167.8, 33.50, 'SFThonburiSemiBold', '#ffffff', 'center', 24, 3, 0, 0, 800, 0);

        drawText(ctx, `${formattedTimePlusOne} น.`, 70, 35, 19, 'SFThonburiRegular', '#666666', 'center', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${batteryLevel}%`, 502.8, 35, 19, 'SFThonburiRegular', '#666666', 'left', 1.5, 3, 0, 0, 800, 0.5);

        drawText(ctx, `${receivername}`, 40.7, 190.3, 24, 'SFThonburiSemiBold', '#000000', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `฿${money01}`, 39.2, 257, 54, 'SFThonburiRegular', '#00c164', 'left', 1.5, 3, 0, 0, 800, -4);
        drawText(ctx, `${formattedDate} ${formattedTime}`, 40.7, 299.3, 18, 'SFThonburiRegular', '#9d9d9d', 'left', 1.5, 3, 0, 0, 800, 0);
        
        drawText(ctx, `ประเภทรายการ`, 40.7, 445, 21, 'SFThonburiRegular', '#9d9d9d', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `จาก`, 40.7, 490, 21, 'SFThonburiRegular', '#9d9d9d', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `ช่องทาง`, 40.7, 565.2, 21, 'SFThonburiRegular', '#9d9d9d', 'left', 1.5, 3, 0, 0, 800, 0);

        drawText(ctx, `รับโอนเงิน`, 537, 445, 21, 'SFThonburiRegular', '#242424', 'right', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${receivername}`, 537, 490, 21, 'SFThonburiRegular', '#242424', 'right', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${receiveraccount}`, 537, 520.1, 21, 'SFThonburiRegular', '#9d9d9d', 'right', 1.5, 3, 0, 0, 800, -1.5);

        drawText(ctx, `MAKE by KBank`, 537, 565.2, 21, 'SFThonburiRegular', '#242424', 'right', 1.5, 3, 0, 0, 800, -1);

        drawText(ctx, `ค้นหา "${receivername}"`, 70.7, 688.4, 21, 'SFThonburiRegular', '#242424', 'left', 1.5, 3, 0, 0, 800, 0);

        if (qrCodeImage) {
            ctx.drawImage(qrCodeImage, 0, 130.3, 555, 951); 
        }

        drawBattery(ctx, batteryLevel, powerSavingMode);
    };

    const backgroundImage = new Image();
    backgroundImage.src = 'assets/image/bs/backgroundEnter-Make1.jpg';
    
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
                lines.push(currentLine.trimStart()); 
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

    characters.forEach((char, index) => {
        ctx.fillText(char, currentPosition, y);
        const charWidth = ctx.measureText(char).width;
        currentPosition += charWidth + letterSpacing;
    });
}

function drawBattery(ctx, batteryLevel, powerSavingMode) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#9b9b9b'; 
    ctx.fillStyle = '#ffffff'; 

    const x = 488.1;
    const y = 21;
    const width = 8.8; 
    const height = 15; 
    const radius = 2;

    let batteryColor = '#666666'; 
    if (batteryLevel <= 20) {
        batteryColor = '#ff0000'; 
    } else if (powerSavingMode) {
        batteryColor = '#fccd0e'; 
    }

    const fillHeight = (batteryLevel / 100) * height; 
    const fillY = y + height - fillHeight; 

    ctx.fillStyle = batteryColor;
    ctx.beginPath();
    ctx.moveTo(x + radius, fillY); 
    ctx.lineTo(x + width - radius, fillY); 
    ctx.arcTo(x + width, fillY, x + width, fillY + radius, radius); 
    ctx.lineTo(x + width, y + height - radius); 
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height); 
    ctx.arcTo(x, y + height, x, y + height - radius, radius); 
    ctx.lineTo(x, fillY + radius); 
    ctx.arcTo(x, fillY, x + radius, fillY, radius); 
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
    link.download = 'slip_make.png';
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