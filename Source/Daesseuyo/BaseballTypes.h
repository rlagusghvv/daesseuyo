#pragma once

#include "CoreMinimal.h"
#include "BaseballTypes.generated.h"

UENUM(BlueprintType)
enum class EPitchType : uint8
{
	FourSeam UMETA(DisplayName = "Four-Seam"),
	TwoSeam UMETA(DisplayName = "Two-Seam"),
	Slider UMETA(DisplayName = "Slider"),
	Curve UMETA(DisplayName = "Curve"),
	Splitter UMETA(DisplayName = "Splitter")
};

UENUM(BlueprintType)
enum class EMvpPlayPhase : uint8
{
	Ready,
	Pitching,
	BattedBall,
	Result
};

USTRUCT(BlueprintType)
struct FBaseballCountState
{
	GENERATED_BODY()

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly)
	int32 Balls = 0;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly)
	int32 Strikes = 0;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly)
	int32 Outs = 2;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly)
	int32 AwayScore = 3;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly)
	int32 HomeScore = 2;

	void ResetCount()
	{
		Balls = 0;
		Strikes = 0;
	}
};

USTRUCT(BlueprintType)
struct FBaseballPitchSpec
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	EPitchType Type = EPitchType::FourSeam;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	float SpeedKph = 145.0f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	float FlightTime = 0.47f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	FVector SpinAxis = FVector::UpVector;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	float SpinRpm = 2200.0f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	float MagnusScale = 1.0f;
};

