package algomarket.problemservice.domain.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import algomarket.problemservice.domain.problem.Problem;
import algomarket.problemservice.domain.shared.Language;
import algomarket.problemservice.domain.submission.Submission;

public class ProblemPublisher {

	public void publish(String authorUsername, Problem problem, List<Submission> submissions, Long maxProblemNumber) {
		if (maxProblemNumber == null) {
			maxProblemNumber = 0L;
		}

		validateAuthorSolve(authorUsername, submissions);

		problem.makePublic(maxProblemNumber + 1);
	}

	private void validateAuthorSolve(String authorUsername, List<Submission> submissions) {
		Set<Language> solvedLanguages = new HashSet<>();

		for (Submission submission : submissions) {
			if (submission.getUsername().equals(authorUsername) && submission.isSolved()) {
				solvedLanguages.add(submission.getLanguage());
			}
		}

		if (solvedLanguages.size() < 2) {
			throw new InsufficientSolvedLanguagesException("문제를 공개하기 위해서는 문제 출제자가 지원하는 언어 중 2개 이상의 언어로 해결해야 합니다.");
		}
	}
}
