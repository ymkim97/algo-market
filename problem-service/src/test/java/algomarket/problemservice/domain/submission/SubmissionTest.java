package algomarket.problemservice.domain.submission;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import algomarket.problemservice.domain.shared.Language;

class SubmissionTest {

	@Test
	void submit() {
		var request = new SubmitRequest(1L, "import java.util.*;", Language.JAVA);

		Submission submission = Submission.submit(request, "username", "Title");

		assertThat(submission.getSubmitStatus()).isEqualTo(SubmitStatus.JUDGING);
		assertThat(submission.getSubmitTime()).isNotNull();
		assertThat(submission.getRuntimeMs()).isNull();
		assertThat(submission.getMemoryKb()).isNull();
	}

	@Test
	void updateStatus() {
		var request = new SubmitRequest(1L, "import java.util.*;", Language.JAVA);
		Submission submission1 = Submission.submit(request, "username", "Title");
		Submission submission2 = Submission.submit(request, "username", "Title");

		submission1.updateStatus(SubmitStatus.ACCEPTED, 1, 300);
		submission2.updateStatus(SubmitStatus.JUDGING, 1, 300);

		assertThat(submission1.getRuntimeMs()).isEqualTo(1);
		assertThat(submission1.getMemoryKb()).isEqualTo(300);
		assertThat(submission2.getRuntimeMs()).isNull();
		assertThat(submission2.getMemoryKb()).isNull();
	}
}
