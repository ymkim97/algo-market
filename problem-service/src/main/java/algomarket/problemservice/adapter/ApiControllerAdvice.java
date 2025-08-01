package algomarket.problemservice.adapter;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import algomarket.problemservice.domain.problem.DuplicateTitleException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class ApiControllerAdvice extends ResponseEntityExceptionHandler {

	@ExceptionHandler(RuntimeException.class)
	public ProblemDetail handleRuntimeException(RuntimeException ex) {
		log.error(ex.getMessage(), ex);
		ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Server Error");

		problemDetail.setProperty("timestamp", LocalDateTime.now());
		problemDetail.setProperty("exception", ex.getClass().getSimpleName());

		return problemDetail;
	}

	@ExceptionHandler(DuplicateTitleException.class)
	public ProblemDetail handleDuplicateTitle(DuplicateTitleException ex) {
		log.error(ex.getMessage(), ex);
		ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "이미 존재하는 문제 제목입니다.");

		problemDetail.setProperty("timestamp", LocalDateTime.now());
		problemDetail.setProperty("exception", ex.getClass().getSimpleName());

		return  problemDetail;
	}
}
