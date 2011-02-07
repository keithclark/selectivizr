$(function() {
	var rgb2hex = function(color) {
		if(~color.indexOf('rgb')) {
			var parts = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
			
			delete (parts[0]);
			
			for (var i = 1; i <= 3; ++i) {
			    parts[i] = parseInt(parts[i]).toString(16);
			    if (parts[i].length == 1) parts[i] = '0' + parts[i];
			}
			return parts.join('');
		} else {
			return color.replace(/#/g, '');
		}
	};
	
	/**/
	test('double class', function() {
		equals(rgb2hex($('#test .dbl-class1.dbl-class2').css('color')), '00ff00', 'Passed');
		
	});
	
	test('a[rel]', function() {
		equals(rgb2hex($('#test a[rel]').css('color')), '0000ff', 'Passed');
	});
	
	test('a[rel=appendix]', function() {
		equals(rgb2hex($('#test a[rel=appendix]').css('color')), 'ff00ff', 'Passed');
	});
	
	test('p:nth-child(2)', function() {
		equals(rgb2hex($('#nth-child p:nth-child(2)').css('color')), '00ff00', 'Passed');
	});
	
	test('p:nth-child(2n)', function() {
		equals(rgb2hex($('#nth-child p:nth-child(2n)').css('color')), '00ff00', 'Passed');
	});
	
	test('p:first-child', function() {
		equals(rgb2hex($('#first-child p:first-child').css('color')), '00ff00', 'Passed');
	});
	
	test('p:last-child', function() {
		equals(rgb2hex($('#last-child p:last-child').css('color')), '00ff00', 'Passed');
	});
	
	test('input:enabled/disabled', function() {
		equals(rgb2hex($('#enabled-disabled input:enabled').css('color')), '00ff00', 'Passed');
		equals(rgb2hex($('#enabled-disabled input:disabled').css('color')), 'ff0000', 'Passed');
	});
	
	test('input:checked', function() {
		equals(rgb2hex($('#checked input:checked').css('color')), '00ff00', 'Passed');
	});
	
	
	
	
	
	/**/
});