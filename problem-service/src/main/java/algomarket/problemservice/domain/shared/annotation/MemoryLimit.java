package algomarket.problemservice.domain.shared.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import algomarket.problemservice.domain.shared.validator.MemoryLimitValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

@Documented
@Constraint(validatedBy = MemoryLimitValidator.class)
@Target({ ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
public @interface MemoryLimit {

	String message() default "메모리 제한은 0MB 초과, 5120MB 이하로 설정 가능합니다.";

	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};
}
