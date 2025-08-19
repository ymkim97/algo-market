package algomarket.problemservice.domain.shared.validator;

import algomarket.problemservice.domain.shared.annotation.TimeLimit;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class TimeLimitValidator implements ConstraintValidator<TimeLimit, Double> {

	@Override
	public boolean isValid(Double value, ConstraintValidatorContext context) {
		if (value == null) return true;

		return value > 0 && value <= 100.0;
	}
}
