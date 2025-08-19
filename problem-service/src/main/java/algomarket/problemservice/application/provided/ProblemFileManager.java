package algomarket.problemservice.application.provided;

import algomarket.problemservice.application.dto.InitiateUploadRequest;
import algomarket.problemservice.application.dto.InitiateUploadResponse;

public interface ProblemFileManager {

	InitiateUploadResponse initiateUpload(InitiateUploadRequest request);
}
