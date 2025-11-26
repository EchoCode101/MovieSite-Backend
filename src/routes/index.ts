import { Router } from "express";

import usersRouter from "./users.routes.js";
import tokenRouter from "./token.routes.js";
import adminRouter from "./admin.routes.js";
import videosRouter from "./videos.routes.js";
import videoMetricsRouter from "./videoMetrics.routes.js";
import reviewsRouter from "./reviews.routes.js";
import commentsRouter from "./comments.routes.js";
import repliesRouter from "./replies.routes.js";
import likesDislikesRouter from "./likesDislikes.routes.js";
import reportsRouter from "./reports.routes.js";
import searchRouter from "./search.routes.js";
import notificationsRouter from "./notifications.routes.js";
import profilesRouter from "./profiles.routes.js";
import watchRouter from "./watch.routes.js";
import subscriptionsRouter from "./subscriptions.routes.js";

const apiRouter = Router();

// Match existing paths from backend/index.js (including backward-compatibility aliases)
apiRouter.use("/users", usersRouter);
apiRouter.use("/user", usersRouter);
apiRouter.use("/token", tokenRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/videos", videosRouter);
apiRouter.use("/members", usersRouter); // Deprecated alias for backward compatibility
apiRouter.use("/profiles", profilesRouter);
apiRouter.use("/watch", watchRouter);
apiRouter.use("/subscriptions", subscriptionsRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.use("/replies", repliesRouter);
apiRouter.use("/video_metrics", videoMetricsRouter);
apiRouter.use("/likes-dislikes", likesDislikesRouter);
apiRouter.use("/reports", reportsRouter);
apiRouter.use("/search", searchRouter);
apiRouter.use("/notifications", notificationsRouter);

export default apiRouter;


