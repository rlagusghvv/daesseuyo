#pragma once

#include "CoreMinimal.h"
#include "BaseballTypes.h"

struct FBaseballPhysics
{
	static constexpr float SimTick = 1.0f / 240.0f;
	static constexpr float PlateX = 90.0f;
	static constexpr float StrikeHalfWidth = 42.0f;
	static constexpr float StrikeBottom = 72.0f;
	static constexpr float StrikeTop = 190.0f;

	static FVector Gravity();
	static FVector ComputePitchAcceleration(const FVector& Velocity, const FBaseballPitchSpec& Pitch);
	static void StepPitch(FVector& Position, FVector& Velocity, const FBaseballPitchSpec& Pitch, float DeltaSeconds);
	static void StepBattedBall(FVector& Position, FVector& Velocity, float DeltaSeconds);
	static FVector SolveInitialVelocity(const FVector& Start, const FVector& Target, float FlightTime);
	static FVector ComputeBattedVelocity(const FVector& IncomingVelocity, const FVector& ContactPoint, const FVector& AimPoint, float TimingQuality, float AimQuality);
	static bool IsStrikeLocation(const FVector& Position);
	static float EstimateContactQuality(const FVector& BallPosition, const FVector& AimPoint);
};

