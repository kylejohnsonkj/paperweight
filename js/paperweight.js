var timeFormat = 'hh:mm a';

var startTime = '7:00am';
var endTime = moment(startTime, timeFormat).add(12, 'hours').format(timeFormat)

var paidHours = '';
var salary = '';
var wage = '';
var pay = '';

$(function() {
    $('#start').timepicker({
        'minTime': startTime,
        'maxTime': endTime
    });

    $('#end').timepicker({
        'minTime': startTime,
        'maxTime': endTime,
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
    $('#paySection, .salary, .hourly, #second').hide();
    
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
        var startTime = moment($('#start').val(), timeFormat);
        var endTime = moment($('#end').val(), timeFormat);
        var duration = moment.duration(endTime.diff(startTime));
        var paidDuration = moment.duration(endTime.diff(startTime));
        $('#hours').text('Total shift length: ' + duration.asHours() + ' hours');
        $('#paySection').show();

        paidHours = paidDuration.asHours()
        $('#paid').val(paidHours);
        $('#paidHours').text('Total hours paid: ' + paidHours + ' hours')
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
    var monthlyEarnings = Math.trunc(salary/12)
    var truncatedWage = Math.trunc(wage*100)/100
    
    $('#dayEarnings').text('$' + truncatedWage + ' * ' + paidHours + ' hours' + ' = $' + dayEarnings + '/day');
    $('#weeklyEarnings').text('Weekly earnings: $' + weeklyEarnings + '/week');
    $('#monthlyEarnings').text('Monthly earnings: $' + monthlyEarnings + '/month');
    
    $('#conversions').show()
}