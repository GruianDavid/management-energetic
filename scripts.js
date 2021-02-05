$(document).ready(function (){
    let isc = 6
    let ki = 0.001
    let t = 300
    let Ir = 1000
    let Im = 1000
    let q = 1.602E-19
    let n = 1
    let k = 1.38E-23
    let I0 = isc/(Math.exp(q*0.6/n/k/t)-1)
    let Rs = 0.5
    let Rsh = 1000

    let valueToBeRead = 0.4
    let backupFunctionsTable ='';

    for (let voltage = 2; voltage<20; voltage++){
        resetFunctionsTable()
        let current = getWantedValueFor(voltage/20)
        if (current < 0){
            //if current is negative load the last functions table
            $('.form-output-functions .table-body').empty().append(backupFunctionsTable)
            break
        }else{
            setValuesInProcessedTable(voltage,current)
        }
    }

    function setValuesInProcessedTable(voltage,current){
        $('.form-output-processed .table-body').append('' +
            '<ul class="table-row">' +
            '<li class="cell" contenteditable>'+(voltage/20).toFixed(2)+'</li>' +
            '<li class="cell" contenteditable>'+(current).toFixed(8)+'</li>' +
            '<li class="cell" contenteditable>'+(current*(voltage/20)).toFixed(8)+'</li>' +
            '<li class="cell" contenteditable>'+((voltage/20)/current).toFixed(8)+'</li>' +
            '</ul>')
    }

    function setValuesInFunctionsTable(fx,f1x,xn1){
        $('.form-output-functions .table-body').append('' +
            '<ul class="table-row">' +
            '<li class="cell">'+(fx).toFixed(8)+'</li>' +
            '<li class="cell">'+(f1x).toFixed(8)+'</li>' +
            '<li class="cell">'+(xn1).toFixed(8)+'</li>' +
            '</ul>')
    }

    function resetFunctionsTable(){
        let table = $('.form-output-functions .table-body')
        backupFunctionsTable = table.clone()
        table.empty()
    }

    function getWantedValueFor(valueToBeRead){
        let index = 0;
        let lastValue = 0
        let xn1 = 0
        let fx,f1x
        let consecutiveSameResults = 0;
        while (true){
            index ++;
            fx = (isc+ki*(t-273))*Ir/Im-I0*(Math.exp(q*(valueToBeRead+Rs*xn1)/n/k/t)-1)-(valueToBeRead+Rs*xn1)/Rsh-xn1
            f1x = -I0*q*Rs*Math.exp(q*(valueToBeRead+xn1*Rs)/k/n/t)/k/n/t-Rs/Rsh-1
            setValuesInFunctionsTable(fx,f1x,xn1)
            xn1 = xn1 - fx/f1x
            if (xn1.toFixed(14) === lastValue.toFixed(14)){
                consecutiveSameResults++
                if (consecutiveSameResults === 10){
                    console.log(index+" : "+lastValue)
                    return lastValue
                }
            }else{
                consecutiveSameResults = 0;
                lastValue = xn1
            }
            if (index === 250){
                return lastValue
            }
        }
    }


    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Putere',
                    data: [{x: 1, y: 2}, {x: 2, y: 4}, {x: 3, y: 8},{x: 4, y: 16}],
                    showLine: true,
                    fill: false,
                    borderColor: 'rgba(0, 200, 0, 1)'
                },
                {
                    label: 'Curent',
                    data: [{x: 1, y: 3}, {x: 3, y: 4}, {x: 4, y: 6}, {x: 6, y: 9}],
                    showLine: true,
                    fill: false,
                    borderColor: 'rgba(200, 0, 0, 1)'
                }
            ]
        },
        options: {
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            },
        }
    });
})