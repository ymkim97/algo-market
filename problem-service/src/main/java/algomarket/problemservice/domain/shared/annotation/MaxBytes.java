package algomarket.problemservice.domain.shared.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import algomarket.problemservice.domain.shared.validator.MaxBytesValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

@Documented
@Constraint(validatedBy = MaxBytesValidator.class)
@Target({ ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
public @interface MaxBytes {
	String message() default "소스 코드는 256KB를 넘을 수 없습니다.";

	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};

	int max();

	String charset() default "UTF-8";
}
