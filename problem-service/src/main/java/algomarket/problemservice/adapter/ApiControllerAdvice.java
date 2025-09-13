package algomarket.problemservice.adapter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import algomarket.problemservice.adapter.lock.DistributedLockException;
import algomarket.problemservice.adapter.storage.UnsupportedFileExtensionException;
import algomarket.problemservice.application.NotFoundException;
import algomarket.problemservice.domain.member.DuplicateEmailException;
import algomarket.problemservice.domain.member.DuplicateUsernameException;
import algomarket.problemservice.domain.member.PasswordOrUsernameMismatchException;
import algomarket.problemservice.domain.problem.DuplicateTitleException;
import algomarket.problemservice.domain.service.InsufficientSolvedLanguagesException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class ApiControllerAdvice {

	@ExceptionHandler(RuntimeException.class)
	public ProblemDetail handleRuntimeException(RuntimeException ex) {
		log.error(ex.getMessage(), ex);

		return getProblemDetail(ex, HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error");
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

	@ExceptionHandler(DuplicateUsernameException.class)
	public ProblemDetail handleDuplicateUsername(DuplicateUsernameException ex) {
		log.error(ex.getMessage(), ex);

		return getProblemDetail(ex, HttpStatus.CONFLICT, ex.getMessage());
	}

	@ExceptionHandler(UnsupportedFileExtensionException.class)
	public ProblemDetail handleUnsupportedFileExtension(UnsupportedFileExtensionException ex) {
		log.error(ex.getMessage(), ex);

		return getProblemDetail(ex, HttpStatus.BAD_REQUEST, ex.getMessage());
	}

	@ExceptionHandler(PasswordOrUsernameMismatchException.class)
	public ProblemDetail handlePasswordOrUsernameMismatch(PasswordOrUsernameMismatchException ex) {
		log.error(ex.getMessage(), ex);

		return getProblemDetail(ex, HttpStatus.UNAUTHORIZED, ex.getMessage());
	}

	@ExceptionHandler(NotFoundException.class)
	public ProblemDetail handleNotFound(NotFoundException ex) {
		log.error(ex.getMessage(), ex);

		return getProblemDetail(ex, HttpStatus.NOT_FOUND, ex.getMessage());
	}

	@ExceptionHandler(InsufficientSolvedLanguagesException.class)
	public ProblemDetail handleInsufficientSolvedLanguages(InsufficientSolvedLanguagesException ex) {
		log.error(ex.getMessage(), ex);

		return getProblemDetail(ex, HttpStatus.BAD_REQUEST, ex.getMessage());
	}

	@ExceptionHandler(DistributedLockException.class)
	public ProblemDetail handleDistributedLock(DistributedLockException ex) {
		log.error(ex.getMessage(), ex);

		return getProblemDetail(ex, HttpStatus.CONFLICT, "서버 내에서 동시 처리가 원활하지 않습니다. 잠시 후 다시 시도해주세요.");
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ProblemDetail handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
		log.error("Validation failed: {}", ex.getMessage());

		List<String> errors = ex.getBindingResult()
			.getFieldErrors()
			.stream()
			.map(error -> error.getField() + ": " + error.getDefaultMessage())
			.collect(Collectors.toList());

		ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
			HttpStatus.BAD_REQUEST, 
			"Validation failed: " + String.join(", ", errors)
		);
		problemDetail.setProperty("timestamp", LocalDateTime.now());
		problemDetail.setProperty("exception", ex.getClass().getSimpleName());
		problemDetail.setProperty("errors", errors);
		
		return problemDetail;
	}

	@ExceptionHandler(ConstraintViolationException.class)
	public ProblemDetail handleConstraintViolation(ConstraintViolationException ex) {
		log.error("Constraint violation: {}", ex.getMessage());

		List<String> errors = ex.getConstraintViolations()
			.stream()
			.map(ConstraintViolation::getMessage)
			.collect(Collectors.toList());

		ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
			HttpStatus.BAD_REQUEST,
			"Validation failed: " + String.join(", ", errors)
		);
		problemDetail.setProperty("timestamp", LocalDateTime.now());
		problemDetail.setProperty("exception", ex.getClass().getSimpleName());
		problemDetail.setProperty("errors", errors);
		
		return problemDetail;
	}

	private static ProblemDetail getProblemDetail(RuntimeException ex, HttpStatus status, String message) {
		ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(status, message);
		problemDetail.setProperty("timestamp", LocalDateTime.now());
		problemDetail.setProperty("exception", ex.getClass().getSimpleName());
		
		return problemDetail;
	}
}
