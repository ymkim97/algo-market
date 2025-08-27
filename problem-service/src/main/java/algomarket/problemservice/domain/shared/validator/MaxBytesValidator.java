package algomarket.problemservice.domain.shared.validator;

import java.nio.charset.Charset;

import algomarket.problemservice.domain.shared.annotation.MaxBytes;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class MaxBytesValidator implements ConstraintValidator<MaxBytes, String> {

	private int max;
	private Charset charset;

	@Override
	public void initialize(MaxBytes constraintAnnotation) {
		this.max = constraintAnnotation.max();
		this.charset = Charset.forName(constraintAnnotation.charset());
	}

	@Override
	public boolean isValid(String value, ConstraintValidatorContext context) {
		if (value == null || value.isEmpty()) {
			return true;
		}

		return value.getBytes(charset).length <= max;
	}
}
