package algomarket.problemservice.adapter;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import algomarket.problemservice.domain.member.DuplicateEmailException;
import algomarket.problemservice.domain.problem.DuplicateTitleException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class ApiControllerAdvice extends ResponseEntityExceptionHandler {

	@ExceptionHandler(RuntimeException.class)
	public ProblemDetail handleRuntimeException(RuntimeException ex) {
		log.error(ex.getMessage(), ex);

		return getProblemDetail(ex, HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ProblemDetail handleIllegalArgumentException(IllegalArgumentException ex) {
		log.error(ex.getMessage(), ex);

		return getProblemDetail(ex, HttpStatus.BAD_REQUEST, ex.getMessage());
	}

	@ExceptionHandler(DuplicateTitleException.class)
	public ProblemDetail handleDuplicateTitle(DuplicateTitleException ex) {
		log.error(ex.getMessage(), ex);

		return getProblemDetail(ex,  HttpStatus.CONFLICT, ex.getMessage());
	}

	@ExceptionHandler(DuplicateEmailException.class)
	public ProblemDetail handleDuplicateEmail(DuplicateEmailException ex) {
		log.error(ex.getMessage(), ex);

		return getProblemDetail(ex, HttpStatus.CONFLICT, ex.getMessage());
	}

	private static ProblemDetail getProblemDetail(RuntimeException ex, HttpStatus status, String message) {
		ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(status, message);
		problemDetail.setProperty("timestamp", LocalDateTime.now());
		problemDetail.setProperty("exception", ex.getClass().getSimpleName());
		
		return problemDetail;
	}
}
