package algomarket.problemservice.application.required;

public interface ProgressSubscriber {

	void subscribeToProgress(Long submissionId);
	
	void unsubscribeFromProgress(Long submissionId);
}
