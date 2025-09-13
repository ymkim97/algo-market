package algomarket.problemservice.adapter.lock;

public class DistributedLockException extends RuntimeException {

	public DistributedLockException(String message) {
		super(message);
	}

	public DistributedLockException(String message, Throwable cause) {
		super(message, cause);
	}
}