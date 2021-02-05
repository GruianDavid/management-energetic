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

    //reset everything on input change
    $("input[type='text']").on('change',function (){
        setValuesAutomatically()
    })

    //for regenerating functions table based on processed table entry
    $(document).on('click','.form-output-processed .table-body .table-row',function (){
        $('.form-output-functions .table-body').empty()
        $('#voltage-function').text($(this).data('voltage'))
        getWantedValueFor($(this).data('voltage'))
    })

    //update local variables based on form values submitted
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
        //check if is manual and add one single value or regenerate tables
        if ($("input[type='checkbox']").is(":checked")){
            addNewValue()
        }else{
            setValuesAutomatically()
        }
    })

    //compute functions, add values to graph and processed data table
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

    //add the new current to graph arrays and rearrange by voltage xAxis
    function addNewCurrent(current){
        currents.push({x:inputVoltage,y:current})
        currents.sort((a, b) => (a.x > b.x) ? 1 : -1)
    }

    //add the new power to graph arrays and rearrange by voltage xAxis
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
        //for more fine tuning replace 20 with a higher value (will take longer to load and calculate all tables)
        //used division by 20 because javascript has issues with adding 0.1 on each run ( ex: 0.1000004 instead of 0.1)
        for (let voltage = 2; voltage<20; voltage++){
            resetFunctionsTable()
            let current = getWantedValueFor(voltage/20)
            if (current < 0){
                //if current is negative load the last functions table stored as backup
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

    //add row to the processed table, one after another
    function setValuesInProcessedTable(voltage,current){
        $('.form-output-processed .table-body').append('' +
            '<ul class="table-row" data-voltage="'+(voltage/20)+'">' +
            '<li class="cell">'+(voltage/20).toPrecision(2)+'</li>' +
            '<li class="cell">'+(current).toPrecision(8)+'</li>' +
            '<li class="cell">'+(current*(voltage/20)).toPrecision(8)+'</li>' +
            '<li class="cell">'+((voltage/20)/current).toPrecision(8)+'</li>' +
            '</ul>')
    }

    //add the manually added values to the processed table in order of voltage
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

    //add row in functions table
    function setValuesInFunctionsTable(fx,f1x,xn1){
        $('.form-output-functions .table-body').append('' +
            '<ul class="table-row">' +
            '<li class="cell">'+(fx).toPrecision(8)+'</li>' +
            '<li class="cell">'+(f1x).toPrecision(8)+'</li>' +
            '<li class="cell">'+(xn1).toPrecision(8)+'</li>' +
            '</ul>')
    }

    //empty functions table but keep last value in case the current becomes negative on next iteration.
    //if that happens, the whole table will be replaced with this one, being the last valid one
    function resetFunctionsTable(){
        let table = $('.form-output-functions .table-body')
        backupFunctionsTable = table.clone()
        table.empty()
    }

    //empty processed table
    function resetProcessedTable(){
        $('.form-output-processed .table-body').empty()
    }

    //calculate each function in functions table and generate rows
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

    //for chart resize/positioning on some device sizes
    function setChartSize(myChart) {
        myChart.canvas.parentNode.style.height = document.getElementById("chartContainer").style.height;
        myChart.canvas.parentNode.style.width = document.getElementById("chartContainer").style.width;
      }

    //generate chart using global variables powers[] and currents[]
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