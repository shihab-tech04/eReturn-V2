// WS00 independent test discovery: PR #10 kept these six actual tests outside npm test's src/tests glob.
// Import executes the original untouched WS06 suite; no tax calculation or production service is invoked.
import '../features/audited-accounts/corporateIntake.test';
