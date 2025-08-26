package algomarket.problemservice.application.provided;

import algomarket.problemservice.application.dto.SubmitResponse;
import algomarket.problemservice.application.event.JudgedEvent;
import algomarket.problemservice.domain.submission.SubmitRequest;

public interface SubmissionHandler {

	SubmitResponse submit(SubmitRequest submitRequest, String username);

	void finishSubmission(JudgedEvent judgedEvent);
}
