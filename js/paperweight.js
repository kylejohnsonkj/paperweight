var timeFormat = 'hh:mm a';

var paidHours = '';
var salary = '';
var wage = '';
var pay = '';

var startTime;
var endTime;
var currentTime;

var percentComplete;
var totalTime;
var timeElapsed;

var progressBar;

$(function() {
    $('#start').timepicker();

    $('#end').timepicker({
        'showDuration': true
    });
    
    $('#start, #end').change(function() {
        updateRange();
        calculateShift();
    });
    
    $('#paid').change(function() {
        paidHours = $(this).val();
        $('#paidHours').text('Total hours paid: ' + paidHours + ' hours')
    });
    
    // comment out line to show all at once
    $('#paySection, .salary, .hourly, #second, #third').hide();
    
    $('input[name=pay]').change(function() {
        pay = $(this).val();
        if (pay == "salary") {
            $('.salary').show();
            $('.hourly').hide();
        } else if (pay == "hourly") {
            $('.hourly').show();
            $('.salary').hide();
        }
    });
    
    $('#hourly_input').change(function() {
        calculateHourlyData();
        calculateSalaryData(true);
    });
    
    $('#salary_input').change(function() {
        calculateSalaryData();
        calculateHourlyData(true);
    });

    $('#paid, #start, #end').change(function() {
        if ($('#second').is(':visible')) {
            if (pay == "salary") {
                calculateSalaryData();
                calculateHourlyData(true);
            } else if (pay == "hourly") {
                calculateHourlyData();
                calculateSalaryData(true);
            }
        }
    });
});

function updateRange() {
    var startTime = moment($('#start').val(), timeFormat);
    var endTime = moment($('#start').val(), timeFormat).add(12, 'hours');
    $('#end').timepicker('option', 'minTime', startTime.format(timeFormat));
    $('#end').timepicker('option', 'maxTime', endTime.format(timeFormat));
}

function calculateShift() {
    if ($('#start').val() && $('#end').val()) {
        startTime = moment($('#start').val(), timeFormat);
        endTime = moment($('#end').val(), timeFormat);

        // adjust for overnight shifts
        if (endTime.isBefore(startTime)) {
            endTime = endTime.add(1, 'days');
        }

        startClock();
        $('#third').show();

        var duration = moment.duration(endTime.diff(startTime));
        var paidDuration = moment.duration(endTime.diff(startTime));
        $('#hours').text('Total shift length: ' + duration.asHours() + ' hours');
        $('#paySection').show();

        paidHours = paidDuration.asHours()
        $('#paid').val(paidHours);
        $('#paidHours').text('Total hours paid: ' + paidHours + ' hours')
    }
}

function startClock() {    
    if (progressBar === undefined) {
        createProgressBar()
        updateTime();
        setInterval(updateTime, 1000);
    }
}

function createProgressBar() {
    progressBar = new ProgressBar.SemiCircle('#progressbar', {
      strokeWidth: 4,
      easing: 'easeInOut',
      duration: 1000,
      color: '#fff',
      trailColor: '#ccc',
      trailWidth: 1,
      svgStyle: null
    });
}

function updateTime() {
    currentTime = moment();
    $('#currentTime').text('Current Time: ' + currentTime.format('h:mm:ss a'));
    calculatePercentComplete();
    calculateTimeWorked();
    calculateProfit()
}

function calculatePercentComplete() {
    timeElapsed = currentTime.unix() - startTime.unix();
    totalTime = endTime.unix() - startTime.unix();
    percentComplete = Math.trunc((timeElapsed / totalTime) * 10000) / 100;

    if (percentComplete < 0) {
        $('#percentComplete').text('Your shift has not started yet.');
        progressBar.animate(0);
    } else if (percentComplete > 100) {
        $('#percentComplete').text('Your shift is over. Enjoy your day!');
        progressBar.animate(1);
    } else {
        $('#percentComplete').text('Percentage Complete: ' + percentComplete + '%');
        progressBar.animate(timeElapsed / totalTime);
    }
}

function calculateTimeWorked() {
    var hours = Math.trunc(timeElapsed / 3600);
    var minutes = Math.trunc((timeElapsed - (hours * 3600)) / 60);
    var timeWorked = '';
    if (hours > 0) {
        timeWorked += hours + ' hour';
        if (hours != 1) {
            timeWorked += 's'
        }
    }
    timeWorked += ' ';
    if (minutes > 0) {
        timeWorked += minutes + ' minute';
        if (minutes != 1) {
            timeWorked += 's'
        }
    }
    $('#timeWorked').text('Time Worked: ' + timeWorked);
}

function calculateProfit() {
    var wagePerSecond = wage / 3600;
    var profit = Math.trunc(wagePerSecond * timeElapsed * 100) / 100;
    var maxProfit = Math.trunc(wage * paidHours);
    if (percentComplete < 0) {
        $('#profit').text('Profit: $0.00');
    } else if (percentComplete > 100) {
        $('#profit').text('End of day profit: $' + maxProfit);
    } else {
        $('#profit').text('Profit thus far: $' + profit.toFixed(2));
    }
}

function calculateHourlyData(secondary = false) {
    if (paidHours == '') { return; }
    
    if (!secondary) {
        wage = $('#hourly_input').val();
    } else {
        var truncatedWage = Math.trunc(wage*100)/100;
        if (truncatedWage > 0) {
            $('#hourly_input').val(truncatedWage);
        }
        $('#annualSalary').hide();
    }
    salary = Math.trunc(wage*paidHours*5*52);
    
    if (salary != '') {
        $('#annualSalary').text('Annual salary equivalent: $' + salary + '/year');
        updateConversions();
        $('#second').show()
    }
}

function calculateSalaryData(secondary = false) {
    if (paidHours == '') { return; }
    
    if (!secondary) {
        salary = $('#salary_input').val();
    } else {
        if (salary > 0) {
            $('#salary_input').val(salary);
        }
        $('#hourlyRate').hide();
    }
    wage = salary/52/paidHours/5;
    
    if (wage != '') {
        $('#hourlyRate').text('Hourly rate equivalent: $' + Math.trunc(wage*100)/100 + '/hour');
        updateConversions();
        $('#second').show()
    }
}

function updateConversions() {
    var dayEarnings = Math.trunc(wage*paidHours)
    var weeklyEarnings = Math.trunc(dayEarnings*5)
    var monthlyEarnings = Math.trunc(weeklyEarnings*4)
    var paycheckEstimate = Math.ceil(salary/24 * 100)/100
    var truncatedWage = Math.trunc(wage*100)/100
    
    $('#dayEarnings').text('Daily earnings ($' + truncatedWage + ' * ' + paidHours + ') = $' + dayEarnings);
    $('#weeklyEarnings').text('Weekly earnings (x5) = $' + weeklyEarnings);
    $('#monthlyEarnings').text('Monthly earnings (x20) = $' + monthlyEarnings);
    $('#paycheckEstimate').text('Bi-weekly paycheck: $' + paycheckEstimate);
    
    $('#conversions').show()
}
