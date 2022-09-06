var toS_day = ["0", "0", "Thứ hai","Thứ ba","Thứ tư","Thứ năm","Thứ sáu", "Thứ bảy", "Chủ nhật"];
var set_Color = new Set();
var titleIndex = new Map();
var isTodayOrCustom = "";
var allText = "";
function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                allText = rawFile.responseText;
                diagram(allText);
            }
        }
    }
    rawFile.send(null);
}

readTextFile("./bkel.txt");

function initSched(){
    /// init
    //header of diagram
    let gr1 = document.createElement("tr");

    let tmp = document.createElement("th");
    tmp.innerHTML = "";
    gr1.appendChild(tmp);

    for (let i = 2; i <= 8; i++){
        tmp = document.createElement("th");
        tmp.innerHTML = toS_day[i];
        gr1.appendChild(tmp);
    }
    document.getElementById("HK-diagram").appendChild(gr1);

    //create the rows of diagram
    for (let r = 1; r <= 15; r++){
        let gr2 = document.createElement("tr");
        let tmp = document.createElement("td");
        tmp.innerHTML = String(r + 6) + "h-" + String(r + 1 + 6) + "h";
        gr2.appendChild(tmp);
        for (let c = 1; c <= 7; c++){
            let tmp = document.createElement("td");
            gr2.appendChild(tmp);
        }
        document.getElementById("HK-diagram").appendChild(gr2);
    }
}

function randomColor(){
    let choicedColor = Math.floor(Math.random()*16777215).toString(16);
    while (set_Color.has(choicedColor)){
        choicedColor = Math.floor(Math.random()*16777215).toString(16);
    }
    set_Color.add(choicedColor);
    return "#" + choicedColor;
}

function swapDateVsMonth(date1){
    let tmp = date1.split("/");
    [tmp[0], tmp[1]] = [tmp[1], tmp[0]];
    return tmp.join('/');
}

function getMondayOfWeek(date) {
    const first = date.getDate() - date.getDay() + 1;

    const monday = new Date(date.setDate(first));
    return monday;
}  

function getCurrentWeekBK(line0){
    let items = line0.split(" ");
    for (let i = 0; i < items.length; i++){
        items[i] = items[i].trim().replace(',',"").replace('.',"");
    }
    let toDay = isTodayOrCustom == "" ? new Date(): new Date(isTodayOrCustom);

    let date2 = new Date(swapDateVsMonth(items.at(-1)));
    date2 = getMondayOfWeek(date2);

    // let diff = toDay.getDate() - date2.getDate();
    let diff = parseInt((toDay - date2) / (1000 * 60 * 60 * 24), 10);
    // console.log(diff);

    // console.log(Number(items[1]) + Math.floor(diff / 7));

    return String(Number(items[1]) + Math.floor(diff / 7));
}

function writeCurrentWeekBK(getCurWeekBK){
    document.getElementById("currentWeek").innerHTML = "Tuần: " + getCurWeekBK;
}

function fillColor(idRow, idCol, color){
    document.getElementById("HK-diagram").rows[idRow].cells[idCol].setAttribute("bgcolor", color);
}

function writeNote(data, colored){
    let item = document.createElement("li");

    let content = ['THỨ','GIỜ HỌC', 'TÊN MÔN HỌC','CƠ SỞ','PHÒNG'];

    let cvtContent = content.map((name) => data[titleIndex.get(name)]);

    item.appendChild(document.createTextNode(cvtContent.join(' | ')));

    item.style.color = colored;

    document.getElementById("note-diagram").appendChild(item);
}

function diagram(allText){
    var lineByLine = allText.split("\n");

    //remove current week and head
    var nrows = lineByLine.length - 2;
    var title = lineByLine[1].trim().split("\t");
    var ncols = title.length;

    //hash string(title bkel) -> int(index column)
    for (let i = 0; i < ncols; i++) {
        titleIndex.set(title[i], i);
    }
    
    //create date 2D array
    var data = new Array(nrows);
    for (var i = 0; i < nrows; i++){
        data[i] = lineByLine[i + 2].split("\t");
    }

    initSched();    

    var getCurWeekBK = getCurrentWeekBK(lineByLine[0]);
    writeCurrentWeekBK(getCurWeekBK);

    for (let i = 0; i < nrows; i++) {
        // random color
        choicedColor = randomColor();

        //1. select week
        let week = data[i][titleIndex.get("TUẦN HỌC")].split('|');
        if (week.includes(getCurWeekBK)){
            // alert(data[i][0]);
            //2. time to study
            let tiet = data[i][titleIndex.get("TIẾT")].split('-').map(Number);
            let exist = false;
            for (let j = tiet[0]; j <= tiet[1] && j != 0; j++){
                exist = true;
                fillColor(j - 1, Number(data[i][titleIndex.get("THỨ")]) - 1, choicedColor);
            }
            if (exist){
                writeNote(data[i], choicedColor);
            }
        }
    }
}

function customDateFunc(){
    let element = document.getElementById("customDate");

    document.getElementById("HK-diagram").innerHTML = "";
    document.getElementById("note-diagram").innerHTML = "";

    isTodayOrCustom = element.value;
    diagram(allText);
}