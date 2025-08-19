package algomarket.problemservice.domain.member;

public class DuplicateUsernameException extends RuntimeException {

	public DuplicateUsernameException(String message) {
		super(message);
	}
}
