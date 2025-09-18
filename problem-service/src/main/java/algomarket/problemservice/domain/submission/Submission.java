package algomarket.problemservice.domain.submission;

import java.time.LocalDateTime;

import algomarket.problemservice.domain.shared.Language;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Submission {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private Long problemId;

	private String problemTitle;

	@Column(nullable = false, length = 20)
	private String username;

	@Column(nullable = false, columnDefinition = "MEDIUMTEXT")
	private String sourceCode;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Language language;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private SubmitStatus submitStatus;

	@Column(nullable = false)
	private LocalDateTime submitTime;

	private Integer runtimeMs;

	private Integer memoryKb;

	public static Submission submit(SubmitRequest submitRequest, String username, String problemTitle) {
		Submission submission = new Submission();

		submission.problemTitle = problemTitle;
		submission.username = username;
		submission.problemId = submitRequest.problemId();
		submission.sourceCode = submitRequest.sourceCode();
		submission.language = submitRequest.language();

		submission.submitStatus = SubmitStatus.JUDGING;
		submission.submitTime = LocalDateTime.now();
		submission.runtimeMs = null;
		submission.memoryKb = null;

		return submission;
	}

	public void updateStatus(SubmitStatus submitStatus, Integer runtimeMs, Integer memoryKb) {
		this.submitStatus = submitStatus;

		if (submitStatus == SubmitStatus.ACCEPTED) {
			this.runtimeMs = runtimeMs;
			this.memoryKb = memoryKb;
		} else {
			this.runtimeMs = null;
			this.memoryKb = null;
		}
	}

	public boolean isSolved() {
		return submitStatus == SubmitStatus.ACCEPTED;
	}

	public void updateProblemTitle(String problemTitle) {
		this.problemTitle = problemTitle;
	}
}
