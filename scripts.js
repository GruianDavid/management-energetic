$(document).ready(function (){
    let isc = 6
    let ki = 0.001
    let t = 300
    let Ir = 1000
    let Im = 1000
    let q = 1.602E-19
    let n = 1
    let k = 1.38E-23
    let Rs = 0.5
    let Rsh = 1000
    let I0 = isc/(Math.exp(q*0.6/n/k/t)-1)
    $('#I0').val(I0.toPrecision(4))
    let inputVoltage = 0.1

    let isManual = false;
    $("input[type='checkbox']").on('change',function (){
        if ($(this).is(":checked"))
        {
            isManual = true
        }else{
            isManual = false
        }
    })

    $("input[type='text']").on('change',function (){
        setValuesAutomatically()
    })

    $(document).on('click','.form-output-processed .table-body .table-row',function (){
        $('.form-output-functions .table-body').empty()
        $('#voltage-function').text($(this).data('voltage'))
        getWantedValueFor($(this).data('voltage'))
    })

    $('#form-params').on('submit',function (e){
        e.preventDefault()
        let form = $(this).serializeArray()
        console.log(form)
        $.each(form,function (item,value){
            switch (value['name']) {
                case 'isc': isc = parseFloat(value['value'])
                    break
                case 'ki': ki = parseFloat(value['value'])
                    break
                case 't': t = parseFloat(value['value'])
                    break
                case 'Ir': Ir = parseFloat(value['value'])
                    break
                case 'Im': Im = parseFloat(value['value'])
                    break
                case 'q': q = parseFloat(value['value'])
                    break
                case 'n': n = parseFloat(value['value'])
                    break
                case 'k': k = parseFloat(value['value'])
                    break
                case 'Rs': Rs = parseFloat(value['value'])
                    break
                case 'Rsh': Rsh = parseFloat(value['value'])
                    break
                case 'voltage': inputVoltage = parseFloat(value['value'])
                    break
                default:
            }
        })
        I0 = isc/(Math.exp(q*0.6/n/k/t)-1)
        if (isManual){
            addNewValue()
        }else{
            setValuesAutomatically()
        }
    })

    function addNewValue(){
        $('.highlight').removeClass('highlight')
        resetFunctionsTable()
        $('#voltage-function').text(inputVoltage)
        let current = getWantedValueFor(inputVoltage)
        addNewCurrent(current)
        addNewPower(current)
        setValueInProcessedTable(inputVoltage,current)
        generateGraph()
    }

    function addNewCurrent(current){
        currents.push({x:inputVoltage,y:current})
        currents.sort((a, b) => (a.x > b.x) ? 1 : -1)
    }

    function addNewPower(current){
        powers.push({x:inputVoltage,y:current*(inputVoltage)})
        powers.sort((a, b) => (a.x > b.x) ? 1 : -1)
    }

    //initial load of values
    let backupFunctionsTable ='';
    let currents = [];
    let powers = [];
    setValuesAutomatically()

    function setValuesAutomatically(){
        currents = [];
        powers = [];
        let lastPower = 0;
        let wasBest = false;
        $('.highlight').removeClass('highlight')
        resetProcessedTable()
        for (let voltage = 2; voltage<20; voltage++){
            resetFunctionsTable()
            let current = getWantedValueFor(voltage/20)
            if (current < 0){
                //if current is negative load the last functions table
                $('.form-output-functions .table-body').empty().append(backupFunctionsTable)
                $('#voltage-function').text((voltage-1)/20)
                generateGraph()
                break
            }else{
                currents.push({x:voltage/20,y:current})
                powers.push({x:voltage/20,y:current*(voltage/20)})
                if (current*(voltage/20) > lastPower && !wasBest){
                    lastPower = current*(voltage/20);
                }else{
                    if (!wasBest){
                        wasBest=true;
                        $("ul[data-voltage='" + (voltage-1)/20 +"']").addClass('best')
                    }
                }
                setValuesInProcessedTable(voltage,current)
            }
        }
    }

    function setValuesInProcessedTable(voltage,current){
        $('.form-output-processed .table-body').append('' +
            '<ul class="table-row" data-voltage="'+(voltage/20)+'">' +
            '<li class="cell">'+(voltage/20).toPrecision(2)+'</li>' +
            '<li class="cell">'+(current).toPrecision(8)+'</li>' +
            '<li class="cell">'+(current*(voltage/20)).toPrecision(8)+'</li>' +
            '<li class="cell">'+((voltage/20)/current).toPrecision(8)+'</li>' +
            '</ul>')
    }

    function setValueInProcessedTable(voltage,current){
        let element = '';
        $('.form-output-processed .table-body').children('ul').each(function (){
            if ($(this).data('voltage') < voltage){
                element = $(this);
                return 0
            }
        })
        if (element === '') {
            $('.form-output-processed .table-body').append('' +
                '<ul class="table-row highlight" data-voltage="' + (voltage) + '">' +
                '<li class="cell">' + (voltage).toPrecision(2) + '</li>' +
                '<li class="cell">' + (current).toPrecision(8) + '</li>' +
                '<li class="cell">' + (current * (voltage)).toPrecision(8) + '</li>' +
                '<li class="cell">' + ((voltage) / current).toPrecision(8) + '</li>' +
                '</ul>')
        }else{
            element.after('' +
                '<ul class="table-row highlight" data-voltage="' + (voltage) + '">' +
                '<li class="cell">' + (voltage).toPrecision(2) + '</li>' +
                '<li class="cell">' + (current).toPrecision(8) + '</li>' +
                '<li class="cell">' + (current * (voltage)).toPrecision(8) + '</li>' +
                '<li class="cell">' + ((voltage) / current).toPrecision(8) + '</li>' +
                '</ul>')
        }
    }

    function setValuesInFunctionsTable(fx,f1x,xn1){
        $('.form-output-functions .table-body').append('' +
            '<ul class="table-row">' +
            '<li class="cell">'+(fx).toPrecision(8)+'</li>' +
            '<li class="cell">'+(f1x).toPrecision(8)+'</li>' +
            '<li class="cell">'+(xn1).toPrecision(8)+'</li>' +
            '</ul>')
    }

    function resetFunctionsTable(){
        let table = $('.form-output-functions .table-body')
        backupFunctionsTable = table.clone()
        table.empty()
    }

    function resetProcessedTable(){
        $('.form-output-processed .table-body').empty()
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

    function setChartSize(myChart) {
        myChart.canvas.parentNode.style.height = document.getElementById("chartContainer").style.height;
        myChart.canvas.parentNode.style.width = document.getElementById("chartContainer").style.width;
      }

    function generateGraph(){
        let ctx = document.getElementById('myChart').getContext('2d');
        let myChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Putere',
                        data: powers,
                        showLine: true,
                        fill: false,
                        borderColor: 'rgba(0, 200, 0, 1)'
                    },
                    {
                        label: 'Curent',
                        data: currents,
                        showLine: true,
                        fill: false,
                        borderColor: 'rgba(200, 0, 0, 1)'
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
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
        setChartSize(myChart)
        window.onresize = setChartSize;
    }
})