package algomarket.problemservice.domain.shared.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import algomarket.problemservice.domain.shared.validator.TimeLimitValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

@Documented
@Constraint(validatedBy = TimeLimitValidator.class)
@Target({ ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
public @interface TimeLimit {

	String message() default "시간 제한은 0초 초과, 10초 이하로 설정 가능합니다.";

	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};
}
