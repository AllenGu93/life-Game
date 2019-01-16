(function () {

    var canvas = document.querySelector("#stage>canvas"),
        ctx = canvas.getContext("2d"),
        width = canvas.width, height = canvas.height;

    function getMouseOffset(evt) {
        return {
            x : evt.offsetX || (evt.layerX + document.body.scrollLeft),
            y : evt.offsetY || (evt.layerY + document.body.scrollTop)
        };
    }

    var gridSize = 9,
        cellSize = width/gridSize;

    var i, cells = [];
    for(i = 0; i < gridSize*gridSize; i++) {
        cells.push({
            index : i,
            position : cellPosition(i),
            side : 0
        });
    }
    var backgroundColor = "#fff8f0";
    function drawGrid() {
        var i;

        ctx.strokeStyle = "#ccc";
        ctx.lineWidth = 3;
        ctx.fillStyle = backgroundColor;
        ctx.beginPath();
        ctx.rect(2, 2, width-4, height-4);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(i = 0; i < gridSize; i++) {
            ctx.moveTo(0, i*cellSize);
            ctx.lineTo(width, i*cellSize);
            ctx.moveTo(i*cellSize, 0);
            ctx.lineTo(i*cellSize, height);
        }
        ctx.stroke();

    }
    function cellAt(x, y) {
        return cells[y*gridSize+x];
    }
    function cellPosition(i) {
        return { x: i % gridSize, y: i / gridSize|0 };
    }
    var sideHues = [0, 60, 180, 120];
    function drawCell(c, noBorder) {
        var x, y, hue;

        x = (c.position.x + 0.5) * cellSize;
        y = (c.position.y + 0.5) * cellSize;
        hue = sideHues[c.side-1];
        noBorder || (ctx.strokeStyle = "hsl(" + hue + ",60%,50%)");
        ctx.fillStyle = c.side == 0 ? backgroundColor : "hsl(" + hue + ",50%,65%)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, cellSize*0.47, 0, 2*Math.PI);
        ctx.fill();
        noBorder || ctx.stroke();
    }
    function countExistNeighbors(c) {
        var neighbor, dx, dy, x, y, count = {};
        for(i = 0; i < 9; i++) {
            if(i != 4) {
                dx = (i % 3) - 1;
                dy = (i/3 | 0) - 1;
                x = c.position.x + dx;
                y = c.position.y + dy;
                if(0 <= x && x < 9 && 0 <= y && y < 9) {
                    neighbor = cellAt(x, y);
                    //console.log(neighbor);
                    if(neighbor.side != 0) {
                        count[neighbor.side] = (count[neighbor.side] || 0) + 1;
                    }
                }
            }

        }
        return count;
    }
    function checkout() {
        var ncs = cells.map(function (c) {
           return countExistNeighbors(c);
        });

        ncs.forEach(function (count, i) {
            var side, n, infos = [];
            var cSide = cells[i].side;
            n = 0;
            for(side in count) {
                infos.push({
                    side : side,
                    count : count[side]
                });
                n += count[side];
            }
            if(cSide != 0) {
                cells[i].side = (n == 1 || n == 2 || n == 3 ? cSide : 0);
            } else {
                if(infos.length > 0 && infos.length < 3) {
                    infos.sort(function (a, b) { return b.count - a.count; });
                    var k;
                    if(n == 3) {
                        cells[i].side = infos[0].side;
                    }
                }
            }
        });
    }
    function initCells() {
        var startPositions = [
            { x:1, y:1},
            { x:7, y:1},
            { x:1, y:7},
            { x:7, y:7}
        ];
        var p, side;
        for(side = 0; side < 4; side++) {
            p = startPositions[side];
            cellAt(p.x, p.y).side = side+1;
        }
    }
    var currentSide = 1;
    function updateFrame() {
        ctx.clearRect(0, 0, width, height);
        drawGrid();
        cells.forEach(function (c) {
            if(c.side != 0) {
                drawCell(c);
            }
        });
        if(mousePosition) {
            var side = currentSide, p = mousePosition;
            if(cellAt(p.x, p.y).side == currentSide) {
                side = 0;
            }
            drawCell({ side : side, position : p }, true);
        }
        requestAnimationFrame(updateFrame, canvas);
    }
    function convertPosition(mp) {
        return {x : mp.x/cellSize | 0, y : mp.y/cellSize | 0};
    }
    canvas.addEventListener("click", function (evt) {
        var mp = getMouseOffset(evt),
            p = convertPosition(mp),
            c = cellAt(p.x, p.y), side = 0;
        if(evt.ctrlKey) {
            console.log(countExistNeighbors(c));
            return;
        }
        side = currentSide;
        c.side = c.side == 0 ? side : 0;
    });
    var mousePosition = null;
    canvas.addEventListener("mousemove", function (evt) {
        var mp = getMouseOffset(evt);
        if(mp.x < 2 || mp.y < 2 || mp.x > width - 2 || mp.y > height - 2) {
            mousePosition = null;
        } else {
            mousePosition = convertPosition(mp);
        }
        //document.getElementById("info").innerHTML = JSON.stringify(mp);
    });
    window.addEventListener("mousemove", function(evt){
        if(evt.target != canvas) {
            mousePosition = null;
        }
    });

    var buttons = document.querySelectorAll("#buttons>button");
    buttons[0].addEventListener("click", function (evt) {
        checkout();
    });
    document.body.addEventListener("keypress", function (evt) {
        var ch = String.fromCharCode(parseInt(evt.which)).toUpperCase();
        switch (ch) {
            case '1': case '2': case '3':case '4':
                currentSide = parseInt(ch);
                break;
        }
    });
    initCells();
    updateFrame();
})();
