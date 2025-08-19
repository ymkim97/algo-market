package algomarket.problemservice.domain.member;

public class PasswordOrUsernameMismatchException extends RuntimeException {

	public PasswordOrUsernameMismatchException(String message) {
		super(message);
	}
}
