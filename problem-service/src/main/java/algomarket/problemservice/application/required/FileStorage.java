package algomarket.problemservice.application.required;

import java.util.Map;

public interface FileStorage {

	String createKeyForProblemUpload(Long problemId, String fileName);

	String createPresignedUrl(String key,  Map<String, String> metadata);
}
