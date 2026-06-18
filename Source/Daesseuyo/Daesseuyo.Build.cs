using UnrealBuildTool;

public class Daesseuyo : ModuleRules
{
	public Daesseuyo(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

		PublicDependencyModuleNames.AddRange(new[]
		{
			"Core",
			"CoreUObject",
			"Engine",
			"ImageWrapper",
			"InputCore"
		});
	}
}
