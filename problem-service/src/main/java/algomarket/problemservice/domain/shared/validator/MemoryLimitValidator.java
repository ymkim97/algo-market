package algomarket.problemservice.domain.shared.validator;

import algomarket.problemservice.domain.shared.annotation.MemoryLimit;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class MemoryLimitValidator implements ConstraintValidator<MemoryLimit, Integer> {

	@Override
	public boolean isValid(Integer value, ConstraintValidatorContext context) {
		return value > 0 && value <= 5120;
	}
}
