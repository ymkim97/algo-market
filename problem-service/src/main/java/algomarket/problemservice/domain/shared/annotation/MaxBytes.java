package algomarket.problemservice.domain.shared.annotation;

import jakarta.validation.Payload;

public @interface MaxBytes {
	String message() default "소스 코드는 256KB를 넘을 수 없습니다.";

	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};

	int max();

	String charset() default "UTF-8";
}
