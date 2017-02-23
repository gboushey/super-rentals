import { test } from 'qunit';
import moduleForAcceptance from 'super-rentals/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | list-rentals');

test('should redirect to rentals route', function (assert) {
	visit('/');
	andThen(function() {
		assert.equal(currentURL(), '/rentals', 'should redirect automatically');
	});
});