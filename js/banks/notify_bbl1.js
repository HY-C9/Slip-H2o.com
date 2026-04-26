 function loadFonts() {
    const fonts = [
        new FontFace('SFThonburiLight', 'url(assets/fonts/SFThonburi.woff)'),
        new FontFace('SFThonburiRegular', 'url(assets/fonts/SFThonburi-Regular.woff)'),
        new FontFace('SFThonburiSemiBold', 'url(assets/fonts/SFThonburi-Semibold.woff)'),
        new FontFace('SFThonburiBold', 'url(assets/fonts/SFThonburi-Bold.woff)'),
        new FontFace('BangkokTime1', 'url(assets/fonts/Bangkok-Time1.woff)'),
        new FontFace('BangkokTime2', 'url(assets/fonts/Bangkok-Time2.woff)'),
        new FontFace('BangkokMoney', 'url(assets/fonts/Bangkok-Money.woff)'),
        new FontFace('BangkokTime', 'url(assets/fonts/Bangkok-Time.woff)'),
        new FontFace('BangkokMoneyRegular', 'url(assets/fonts/Bangkok-Money-Regular.woff)'),
        new FontFace('BangkokMoneyMedium', 'url(assets/fonts/Bangkok-Money-Medium.woff)'),
        new FontFace('BangkokMoneySemiBold', 'url(assets/fonts/Bangkok-Money-SemiBold.woff)'),
        new FontFace('BangkokMoneyBold', 'url(assets/fonts/Bangkok-Money-Bold.woff)')
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
    const day = formattedDate.split(' ')[0];
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
    const datetime = document.getElementById('datetime')?.value || '-';
    const datetimePlusOne = document.getElementById('datetime_plus_one')?.value || '-';
    const batteryLevel = document.getElementById('battery')?.value || '100';
    const senderaccount = document.getElementById('senderaccount')?.value || '-';
    const money01 = document.getElementById('money01')?.value || '-';
    
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

        if(bgImg) {
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        drawText(ctx, `${formattedTimePlusOne}`, 63.4, 45.8, 22.50, 'SFThonburiSemiBold', '#ffffff', 'left', 1.5, 3, 0, 0, 800, 0);
        
        drawText(ctx, `ข้อความล่าสุดเมื่อ ${formattedDate}, ${formattedTime}`, 55.8, 128.4, 17.00, 'BangkokTime', '#ffffff', 'center', 1.5, 3, 0, 0, 800, 0);

        drawText(ctx, `${senderaccount}`, 51.0, 274.0, 25.00, 'BangkokMoneyMedium', '#020924', 'left', 1.5, 3, 0, 0, 800, 0);

        drawText(ctx, `${money01}`, 87.0, 362.9, 35.43, 'BangkokMoneyMedium', '#020924', 'right', 1.5, 3, 0, 0, 800, -0.50);
        drawText(ctx, `THB`, 42.5, 362.9, 20.85, 'BangkokMoneyRegular', '#020924', 'right', 1.5, 3, 0, 0, 800, -0.50);

        if (qrCodeImage) {
            ctx.drawImage(qrCodeImage, 0, 130.3, 555, 951);
        }

        drawBattery(ctx, batteryLevel, powerSavingMode);
    }

    const backgroundImage = new Image();
    backgroundImage.src = 'assets/image/bs/backgroundEnter-B1.jpg';
    
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
        const words = paragraph.split(' ');
        let currentLine = '';
        const lines = [];

        for (let i = 0; i < words.length; i++) {
            const testLine = currentLine + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width + (testLine.length - 1) * letterSpacing;

            if (testWidth > maxWidth && i > 0) {
                lines.push(currentLine);
                currentLine = words[i] + ' ';
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);

        lines.forEach((line, index) => {
            let currentX = x;
            if (align === 'center') {
                currentX = (ctx.canvas.width - ctx.measureText(line).width) / 1.98 - ((line.length - 1) * letterSpacing) / 2;
            } else if (align === 'right') {
                currentX = ctx.canvas.width - x - ctx.measureText(line).width - ((line.length - 1) * letterSpacing);
            }

            drawTextLine(ctx, line.trim(), currentX, currentY, letterSpacing);
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

    const characters = text.split('');
    let currentPosition = x;

    characters.forEach((char, index) => {
        const charCode = char.charCodeAt(0);
        const prevChar = index > 0 ? characters[index - 1] : null;
        const prevCharCode = prevChar ? prevChar.charCodeAt(0) : null;

        const isUpperVowel = (charCode >= 0x0E34 && charCode <= 0x0E37);
        const isToneMark = (charCode >= 0x0E48 && charCode <= 0x0E4C);
        const isBeforeVowel = (charCode === 0x0E31);
        const isBelowVowel = (charCode >= 0x0E38 && charCode <= 0x0E3A);

        let yOffset = 0;
        let xOffset = 0;

        if (isUpperVowel) {
            yOffset = -1;
            xOffset = 0;
        }

        if (isToneMark) {
            if (prevChar && ((prevChar.charCodeAt(0) >= 0x0E34 && prevChar.charCodeAt(0) <= 0x0E37) || prevChar.charCodeAt(0) === 0x0E31)) {
                yOffset = -8; 
                xOffset = 0; 
            } else {
                yOffset = 0; 
                xOffset = -7; 
            }
        }

        if (isBeforeVowel) {
            yOffset = -1;
            xOffset = 1;
        }

        if (isBelowVowel) {
            yOffset = 0;
            xOffset = -10;
        }

        ctx.fillText(char, currentPosition + xOffset, y + yOffset);

        if (!isToneMark && !isBeforeVowel && !isBelowVowel) {
            currentPosition += ctx.measureText(char).width + letterSpacing;
        } else {
            currentPosition += ctx.measureText(char).width;
        }
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

    const fillWidth = (batteryLevel / 100) * 29.5; 
    const x = 481.0;
    const y = 30.4;
    const height = 12.8;
    const radius = 4; 

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
    link.download = 'slip_bbl1.png';
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